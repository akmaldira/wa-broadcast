"use client";

import { Contact } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import UpsertContactDialog from "./upsert-contact-dialog";
import DeleteContactDialog from "./delete-contact-dialog";

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      return row.original.name || "-";
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Nomor Telepon",
    cell: ({ row }) => {
      const countryCode = row.original.countryCode;
      const phoneNumber = row.original.phoneNumber;
      return (
        <div className="flex items-center gap-2">
          <span>({countryCode})</span>
          <span>{phoneNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <UpsertContactDialog contact={row.original} />
          <DeleteContactDialog contact={row.original} />
        </div>
      );
    },
  },
];
