import { BaileysEventHandler } from "@/types/whatsapp";
import { WASocket } from "@whiskeysockets/baileys";

export default class WhatsAppHandler {
  private readonly isListen: boolean = false;
  private readonly socket: WASocket;

  constructor(socket: WASocket) {
    this.socket = socket;
    this.listen();
  }

  private messageUpsertHandler: BaileysEventHandler<"messages.upsert"> =
    async ({ messages, type: _ }) => {
      const { message: _message, key, pushName: _pushName } = messages[0];
      const fromJid = key.remoteJid;
      const fromMe = key.fromMe;
      const isGroup = key.remoteJid?.endsWith("@g.us");
      if (isGroup) return;
      if (!fromJid) return;
      if (process.env.NODE_ENV !== "development") {
        if (fromMe) return;
      }
      // On message event
    };

  public listen() {
    if (this.isListen) return;

    this.socket.ev.on("messages.upsert", this.messageUpsertHandler);
  }

  public unlisten() {
    if (!this.isListen) return;

    this.socket.ev.off("messages.upsert", this.messageUpsertHandler);
  }
}
