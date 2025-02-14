"use server";

import { hashPassword } from "@/lib/bcrypt";
import { LOGIN_ROUTE } from "@/lib/const";
import { prisma } from "@/lib/prisma";
import { ServerAction } from "@/types/action";
import { User } from "@prisma/client";
import { z } from "zod";
import { registerSchema } from "./schema";

export async function registerAction(
  values: z.infer<typeof registerSchema>
): Promise<ServerAction<Omit<User, "password">>> {
  try {
    const isEmailExists = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (isEmailExists) {
      return {
        status: "error",
        error: "Email sudah terdaftar",
      };
    }

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        password: hashPassword(values.password),
      },
    });

    const { password, ...userData } = user;

    return {
      status: "success",
      data: userData,
      message: "Berhasil mendaftar, silahkan login",
      redirect: LOGIN_ROUTE,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
