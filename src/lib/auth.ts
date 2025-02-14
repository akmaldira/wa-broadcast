import { loginSchema } from "@/app/(auth)/login/schema";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { comparePassword } from "./bcrypt";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encode as defaultEncode } from "next-auth/jwt";
import { v4 as uuid } from "uuid";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

const adapter = PrismaAdapter(prisma);
export const { handlers, signIn, signOut, auth } = NextAuth({
  // @ts-ignore
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("Email atau password salah");
          }

          if (!user.password) {
            throw new Error("Akun anda terdaftar dengan metode lain");
          }

          const isValidPassword = comparePassword(password, user.password);
          if (!isValidPassword) {
            throw new Error("Email atau password salah");
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});
