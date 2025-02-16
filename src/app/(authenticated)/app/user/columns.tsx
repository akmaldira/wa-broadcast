"use client";

import { ColumnDef } from "@tanstack/react-table";
import DeleteUserDialog from "./delete-user-dialog";
import { UserWithoutPassword } from "@/types/prisma";

export const columns: ColumnDef<UserWithoutPassword>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      return row.original.name || "-";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <DeleteUserDialog user={row.original} />
        </div>
      );
    },
  },
];
