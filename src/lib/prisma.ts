import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

const prismaClientSingleton = () => {
  const client = new PrismaClient();
  return client;
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
