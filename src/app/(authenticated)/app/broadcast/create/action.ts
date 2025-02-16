"use server";

import { prisma } from "@/lib/prisma";
import { ServerAction } from "@/types/action";
import { getWhatsAppBotsAction } from "../../whatsapp/action";
import { auth } from "@/lib/auth";

export async function getWhatsAppWithBotsAction(): Promise<
  ServerAction<
    {
      qrCode: string | undefined;
      status: "unknown" | "connecting" | "connected" | "disconnected";
      name: string;
      id: string;
      apiKey: string;
      reachReconnectLimit: boolean;
      isActive: boolean;
    }[]
  >
> {
  try {
    const session = await auth();
    const userSession = session?.user;
    if (!session || !userSession) {
      return {
        status: "error",
        error: "Silakan login terlebih dahulu",
        redirect: "/login",
      };
    }

    if (!["ROOT", "ADMIN"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }
    const prismaWhatsApps = await prisma.whatsApp.findMany();
    const whatsAppsBots = await getWhatsAppBotsAction();
    if (whatsAppsBots.status === "error") {
      return whatsAppsBots;
    }

    const whatsApp = prismaWhatsApps.map((whatsApp) => {
      const bot = whatsAppsBots.data.find((bot) => bot.id === whatsApp.id);
      return {
        ...whatsApp,
        qrCode: bot?.qrCode,
        status:
          bot?.status ||
          ("unknown" as
            | "unknown"
            | "connecting"
            | "connected"
            | "disconnected"),
      };
    });

    return {
      status: "success",
      data: whatsApp,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
