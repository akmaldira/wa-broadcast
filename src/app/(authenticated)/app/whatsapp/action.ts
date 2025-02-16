"use server";

import { ServerAction } from "@/types/action";
import { WhatsAppBotStatus } from "@/types/whatsapp";
import { z } from "zod";
import { addWhatsAppSchema } from "./schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function createWhatsAppBotApi(id: string, name: string) {
  const response = await fetch(process.env.BASE_URL + "/api2/whatsapp", {
    method: "POST",
    headers: {
      "x-private-api": process.env.PRIVATE_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    return {
      status: "error",
      error: data.error,
    };
  }

  const data = await response.json();
  return data.data;
}

export async function createWhatsAppBotAction(
  values: z.infer<typeof addWhatsAppSchema>
): Promise<ServerAction<WhatsAppBotStatus>> {
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
    const prismaWhatsApp = await prisma.whatsApp.create({
      data: {
        name: values.name,
      },
    });

    const bot = await createWhatsAppBotApi(
      prismaWhatsApp.id,
      prismaWhatsApp.name
    );
    if (bot.status === "error") {
      await prisma.whatsApp.delete({
        where: { id: prismaWhatsApp.id },
      });
      return {
        status: "error",
        error: bot.error,
      };
    }
    revalidatePath("/app/whatsapp");
    return {
      status: "success",
      data: {
        ...bot,
        id: prismaWhatsApp.id,
        name: prismaWhatsApp.name,
      },
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function getWhatsAppBotAction(
  id: string
): Promise<ServerAction<WhatsAppBotStatus>> {
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
    const response = await fetch(
      process.env.BASE_URL + "/api2/whatsapp/" + id,
      {
        headers: {
          "x-private-api": process.env.PRIVATE_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return {
        status: "error",
        error: data.error,
      };
    }

    const data = await response.json();
    return {
      status: "success",
      data: data.data,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function getWhatsAppBotsAction(): Promise<
  ServerAction<WhatsAppBotStatus[]>
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
    const response = await fetch(process.env.BASE_URL + "/api2/whatsapp", {
      headers: {
        "x-private-api": process.env.PRIVATE_API_KEY || "",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        status: "error",
        error: data.error,
      };
    }

    const data = await response.json();
    return {
      status: "success",
      data: data.data,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function deleteWhatsAppBotAction(
  id: string
): Promise<ServerAction<void>> {
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
    const response = await fetch(
      process.env.BASE_URL + "/api2/whatsapp/" + id,
      {
        method: "DELETE",
        headers: {
          "x-private-api": process.env.PRIVATE_API_KEY || "",
        },
      }
    );
    if (!response.ok) {
      const data = await response.json();
      return {
        status: "error",
        error: data.error,
      };
    }

    revalidatePath("/app/whatsapp");
    return {
      status: "success",
      data: undefined,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function reconnectWhatsAppBotAction(
  id: string
): Promise<ServerAction<WhatsAppBotStatus>> {
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
    const whatsApp = await prisma.whatsApp.findUnique({
      where: { id },
    });
    if (!whatsApp) {
      return {
        status: "error",
        error: "WhatsApp not found",
      };
    }
    const response = await fetch(
      process.env.BASE_URL + "/api2/whatsapp/reconnect",
      {
        method: "POST",
        headers: {
          "x-private-api": process.env.PRIVATE_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name: whatsApp.name }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      return {
        status: "error",
        error: data.error,
      };
    }

    const data = await response.json();
    await prisma.whatsApp.update({
      where: { id },
      data: {
        isActive: true,
        reachReconnectLimit: false,
      },
    });
    revalidatePath("/app/whatsapp");
    return {
      status: "success",
      data: data.data,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
