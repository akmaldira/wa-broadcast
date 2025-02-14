"use server";

import { signIn, signOut } from "@/lib/auth";
import { ServerAction } from "@/types/action";
import { AuthError } from "next-auth";
import { z } from "zod";
import { loginSchema } from "./schema";
import { APP_ROUTE } from "@/lib/const";

export async function loginAction(
  values: z.infer<typeof loginSchema>
): Promise<ServerAction<null>> {
  try {
    const redirectUrl = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    return {
      status: "success",
      data: null,
      redirect: APP_ROUTE,
      message: "Anda berhasil masuk.",
    };
  } catch (error: any) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        error: error.cause?.err?.message || "Terjadi kesalahan saat masuk.",
      };
      switch (error.type) {
        case "CredentialsSignin":
          return {
            status: "error",
            error: "Email atau password salah",
          };
        default:
          return {
            status: "error",
            error: "Terjadi kesalahan saat masuk",
          };
      }
    }
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function logoutAction() {
  await signOut();
}
