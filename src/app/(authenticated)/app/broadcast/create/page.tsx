import { prisma } from "@/lib/prisma";
import BroadcastForm from "./form";

export default async function CreateBroadcastPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      <div className="flex items-center justify-center w-full pb-8">
        <BroadcastForm contacts={contacts} />
      </div>
    </div>
  );
}
