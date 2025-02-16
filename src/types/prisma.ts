import { Prisma, User, WhatsApp } from "@prisma/client";
import { ConnectionState } from "@whiskeysockets/baileys";

export type WhatsAppWithData = WhatsApp & {
  connectionState?: Partial<ConnectionState>;
  qrCode?: string;
  status?: "connecting" | "connected" | "disconnected" | string;
};

export type BroadcastWithWhatsApp = Prisma.BroadcastGetPayload<{
  include: {
    whatsApp: true;
  };
}>;

export type UserWithoutPassword = Omit<User, "password">;
