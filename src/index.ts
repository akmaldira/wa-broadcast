import { hashPassword } from "./lib/bcrypt";
import { prisma } from "./lib/prisma";
import { startServer } from "./server";
import { initWhatsAppBots } from "./whatsapp";
import "dotenv/config";

initWhatsAppBots().then(async () => {
  const rootEmail = process.env.ROOT_EMAIL;
  const rootPass = process.env.ROOT_PASS;

  if (rootEmail && rootPass) {
    await prisma.user.upsert({
      where: {
        email: rootEmail,
      },
      create: {
        name: "Root",
        email: rootEmail,
        password: hashPassword(rootPass),
        role: "ROOT",
      },
      update: {
        password: hashPassword(rootPass),
      },
    });
  }
  startServer();
});
