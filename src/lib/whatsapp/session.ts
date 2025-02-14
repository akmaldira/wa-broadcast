import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
} from "@whiskeysockets/baileys";
import { logger } from "./logger";
import { prisma } from "../../lib/prisma";

const fixId = (id: string) => id.replace(/\//g, "__").replace(/:/g, "-");

export async function useWhatsAppSession(whatsAppId: string): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const write = async (data: any, id: string) => {
    try {
      data = JSON.stringify(data, BufferJSON.replacer);
      id = fixId(id);
      await prisma.whatsAppSession.upsert({
        select: { id: true },
        create: { data, id: `${id}-${whatsAppId}`, whatsAppId },
        update: { data },
        where: { id_whatsAppId: { id: `${id}-${whatsAppId}`, whatsAppId } },
      });
    } catch (e) {
      logger.error(e, "An error occured during session write");
    }
  };

  const read = async (id: string) => {
    try {
      id = fixId(id);
      const result = await prisma.whatsAppSession.findUnique({
        select: { data: true },
        where: { id_whatsAppId: { id: `${id}-${whatsAppId}`, whatsAppId } },
      });

      if (!result) {
        logger.info({ id }, "Trying to read non existent session data");
        return null;
      }

      return JSON.parse(result.data, BufferJSON.reviver);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
        logger.info({ id }, "Trying to read non existent session data");
      } else {
        logger.error(e, "An error occured during session read");
      }
      return null;
    }
  };

  const del = async (id: string) => {
    try {
      id = fixId(id);
      await prisma.whatsAppSession.delete({
        select: { id: true },
        where: { id_whatsAppId: { id: `${id}-${whatsAppId}`, whatsAppId } },
      });
    } catch (e) {
      logger.error(e, "An error occured during session delete");
    }
  };

  const creds: AuthenticationCreds = (await read("creds")) || initAuthCreds();

  const keys = {
    get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
      const data: { [key: string]: SignalDataTypeMap[typeof type] } = {};
      await Promise.all(
        ids.map(async (id) => {
          let value = await read(`${type}-${id}`);
          if (type === "app-state-sync-key" && value) {
            value = proto.Message.AppStateSyncKeyData.fromObject(value);
          }
          data[id] = value;
        })
      );
      return data;
    },
    set: async (data: any): Promise<void> => {
      const tasks: Promise<void>[] = [];

      for (const category in data) {
        for (const id in data[category]) {
          const value = data[category][id];
          const sId = `${category}-${id}`;
          tasks.push(value ? write(value, sId) : del(sId));
        }
      }
      await Promise.all(tasks);
    },
  };

  return {
    state: { creds, keys },
    saveCreds: async () => write(creds, "creds"),
  };
}
