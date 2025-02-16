"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServerAction } from "@/types/action";
import { UserWithoutPassword } from "@/types/prisma";
import { z } from "zod";
import { addUserSchema } from "./schema";
import { hashPassword } from "@/lib/bcrypt";
import { revalidatePath } from "next/cache";

export async function addUserAction(
  values: z.infer<typeof addUserSchema>
): Promise<ServerAction<UserWithoutPassword>> {
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

    if (!["ROOT"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }

    const isDuplicate = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });

    if (isDuplicate) {
      return {
        status: "error",
        error: "Email ini sudah terdaftar",
      };
    }

    const user = await prisma.user.create({
      data: {
        ...values,
        password: hashPassword(values.password),
      },
    });

    const { password, ...userWithoutPassword } = user;

    revalidatePath("/app/user");
    return {
      status: "success",
      data: userWithoutPassword,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function deleteUserAction(
  id: string
): Promise<ServerAction<UserWithoutPassword>> {
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

    if (!["ROOT"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }

    if (userSession.id === id) {
      return {
        status: "error",
        error: "Anda tidak bisa menghapus akun anda sendiri",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return {
        status: "error",
        error: "Pengguna tidak ditemukan",
      };
    }

    const { password, ...userWithoutPassword } = await prisma.user.delete({
      where: {
        id,
      },
    });

    revalidatePath("/app/user");
    return {
      status: "success",
      data: userWithoutPassword,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
