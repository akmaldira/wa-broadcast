import { WhatsApp } from "@prisma/client";
import { ConnectionState } from "@whiskeysockets/baileys";

export type WhatsAppWithData = WhatsApp & {
  connectionState?: Partial<ConnectionState>;
  qrCode?: string;
  status?: "connecting" | "connected" | "disconnected" | string;
};
