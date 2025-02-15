import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function HistoryBroadcastPage() {
  const broadcast = await prisma.broadcast.findMany({
    include: {
      whatsApp: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const contacts = await prisma.contact.findMany();

  const data = broadcast.map((broadcast) => {
    return {
      ...broadcast,
      toContact: contacts.filter((contact) =>
        broadcast.toContactIds.includes(contact.id)
      ),
    };
  });
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
