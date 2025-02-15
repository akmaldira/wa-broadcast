import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getWhatsAppBotsAction } from "./action";

export default async function WhatsAppPage() {
  const prismaWhatsApps = await prisma.whatsApp.findMany();
  const whatsAppsBots = await getWhatsAppBotsAction();
  if (whatsAppsBots.status === "error") {
    return (
      <div className="flex items-center justify-center mt-[20vh]">
        <h1>Error getting WhatsApp bots</h1>
        <p className="text-destructive">{whatsAppsBots.error}</p>
      </div>
    );
  }

  const whatsApp = prismaWhatsApps.map((whatsApp) => {
    const bot = whatsAppsBots.data.find((bot) => bot.id === whatsApp.id);
    return {
      ...whatsApp,
      connectionState: bot?.connectionState,
      qrCode: bot?.qrCode,
      status: bot?.status || "unknown",
    };
  });

  return (
    <div>
      <DataTable columns={columns} data={whatsApp} />
    </div>
  );
}
