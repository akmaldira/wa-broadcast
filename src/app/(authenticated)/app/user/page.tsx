import { prisma } from "@/lib/prisma";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserPage() {
  const session = await auth();
  const user = session?.user;

  if (!session || !user) {
    redirect("/");
  }
  if (session.user.role !== "ROOT") {
    redirect("/app");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
