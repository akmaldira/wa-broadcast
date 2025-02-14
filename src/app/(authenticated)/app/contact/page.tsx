import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function PhonePage() {
  const contacts = await prisma.contact.findMany();

  return (
    <div>
      <DataTable columns={columns} data={contacts} />
    </div>
  );
}
