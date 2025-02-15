import makeWASocket, {
  AnyMediaMessageContent,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  SocketConfig,
} from "@whiskeysockets/baileys";
import { prisma } from "./lib/prisma";
import {
  MAX_RECONNECT_RETRIES,
  RECONNECT_INTERVAL,
} from "./lib/whatsapp/config";
import { WhatsAppBot } from "./types/whatsapp";
import { logger } from "./lib/whatsapp/logger";
import { Boom } from "@hapi/boom";
import P from "pino";
import { toDataURL } from "qrcode";
import WhatsAppHandler from "./lib/whatsapp/handler";
import { useWhatsAppSession } from "./lib/whatsapp/session";

const whatsAppBots = new Map<string, WhatsAppBot>();
const retries = new Map<string, number>();

export async function initWhatsAppBots() {
  const bots = await prisma.whatsApp.findMany({
    where: { isActive: true },
  });
  await Promise.all(
    bots.map(({ id, name }) =>
      createWhatsAppBot({ whatsAppId: id, whatsappName: name })
    )
  );
}

function shouldReconnect(botId: string) {
  let attempts = retries.get(botId) ?? 0;

  if (attempts < MAX_RECONNECT_RETRIES) {
    attempts += 1;
    retries.set(botId, attempts);
    return true;
  }
  return false;
}

type CreateSessionOptions = {
  whatsAppId: string;
  whatsappName: string;
  socketConfig?: SocketConfig;
};
export async function createWhatsAppBot(options: CreateSessionOptions) {
  const { whatsAppId, whatsappName, socketConfig: _ } = options;

  const destroy = async (logout = true, reachReconnectLimit = false) => {
    try {
      await Promise.all([
        logout && socket.logout(),
        prisma.whatsAppSession.deleteMany({
          where: { whatsAppId },
        }),
        reachReconnectLimit &&
          prisma.whatsApp.update({
            where: { id: whatsAppId },
            data: { reachReconnectLimit, isActive: false },
          }),
        !reachReconnectLimit &&
          prisma.whatsApp.delete({
            where: { id: whatsAppId },
          }),
      ]);
      logger.info({ whatsapp: whatsAppId }, "Bot destroyed");
    } catch (e) {
      logger.error(e, "An error occured during bot destroy");
    } finally {
      whatsAppBots.delete(whatsAppId);
    }
  };

  const handleConnectionClose = async (bot: WhatsAppBot) => {
    const code = (bot.connectionState.lastDisconnect?.error as Boom)?.output
      ?.statusCode;
    const restartRequired = code === DisconnectReason.restartRequired;
    const doNotReconnect = !shouldReconnect(whatsAppId);

    if (code === DisconnectReason.loggedOut || doNotReconnect) {
      destroy(doNotReconnect, doNotReconnect);
      bot.status = "disconnected";
      return;
    }

    if (!restartRequired) {
      logger.info(
        { attempts: retries.get(whatsAppId) ?? 1, whatsAppId },
        "Reconnecting..."
      );
    }
    setTimeout(
      () => createWhatsAppBot(options),
      restartRequired ? 0 : RECONNECT_INTERVAL
    );
  };

  const handleConnectionUpdate = async (bot: WhatsAppBot) => {
    if (bot.connectionState.qr?.length) {
      try {
        const qr = await toDataURL(bot.connectionState.qr);
        bot.qrCode = qr;
        return;
      } catch (e) {
        logger.error(e, "An error occured during QR generation");
      }
    } else if (bot.connectionState.connection === "open") {
      bot.status = "connected";
      bot.qrCode = undefined;
    }
  };

  const { version } = await fetchLatestBaileysVersion();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { state, saveCreds } = await useWhatsAppSession(whatsAppId);
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: Browsers.macOS("Safari"),
    generateHighQualityLinkPreview: true,
    auth: state,
    version: version,
    logger: P({ level: "silent" }) as any,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
  });
  let handler: WhatsAppHandler | undefined = undefined;
  if (whatsappName.endsWith("bot")) {
    handler = new WhatsAppHandler(socket);
  }
  whatsAppBots.set(whatsAppId, {
    ...socket,
    id: whatsAppId,
    handler,
    destroy,
    connectionState: { connection: "close" },
    status: "connecting",
  });

  socket.ev.on("creds.update", saveCreds);
  socket.ev.on("connection.update", async (update) => {
    const bot = whatsAppBots.get(whatsAppId);
    if (!bot) {
      await destroy();
      return;
    }
    bot.connectionState = update;
    const { connection } = update;

    if (connection === "open") {
      retries.delete(whatsAppId);
      bot.status = "connected";
    }
    if (connection === "close") handleConnectionClose(bot);
    handleConnectionUpdate(bot);
  });

  // Debug events
  // socket.ev.on("messaging-history.set", (data) => dump("messaging-history.set", data));
  // socket.ev.on("chats.upsert", (data) => logger.info({ data }, "chats.upsert"));
  // socket.ev.on("contacts.update", (data) => dump("contacts.update", data));
  // socket.ev.on("groups.upsert", (data) => dump("groups.upsert", data));
  // socket.ev.on("messages.upsert", (data) =>
  //   logger.info({ data }, "messages.upsert")
  // );
}

export function getWhatsAppBot(whatsAppId: string) {
  const bot = whatsAppBots.get(whatsAppId);
  if (!bot) return;
  return {
    id: whatsAppId,
    connectionState: bot.connectionState,
    qrCode: bot.qrCode,
    status: bot.status,
  };
}

export function getWhatsAppBots() {
  return Array.from(whatsAppBots.entries()).map(([id, bot]) => ({
    id,
    connectionState: bot.connectionState,
    qrCode: bot.qrCode,
    status: bot.status,
  }));
}

export async function deleteWhatsAppBot(whatsAppId: string) {
  const bot = whatsAppBots.get(whatsAppId);
  if (!bot) return;
  await bot.destroy(true);
}

export async function jidExists(
  whatsAppId: string,
  jid: string,
  type: "group" | "number" = "number"
) {
  const whatsAppBot = whatsAppBots.get(whatsAppId);
  if (!whatsAppBot) return;
  try {
    if (type === "number") {
      const results = await whatsAppBot.onWhatsApp(jid);
      const result = results ? results[0] : undefined;
      return !!result?.exists;
    }

    const groupMeta = await whatsAppBot.groupMetadata(jid);
    return !!groupMeta.id;
  } catch (e) {
    throw e;
  }
}

export async function sendMessage(
  whatsAppId: string,
  jid: string,
  message: string,
  media?: AnyMediaMessageContent
) {
  const whatsAppBot = whatsAppBots.get(whatsAppId);
  if (!whatsAppBot) throw new Error(`WhatsApp with id ${whatsAppId} not found`);
  try {
    if (media) {
      const result = await whatsAppBot.sendMessage(jid, media);
      return result;
    }
    const response = await whatsAppBot.sendMessage(jid, {
      text: message,
    });
    return response;
  } catch (e) {
    throw e;
  }
}
