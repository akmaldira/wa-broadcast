"use client";

import { BroadcastWithWhatsApp } from "@/types/prisma";
import { Contact } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import ContactDialog from "./contact-dialog";
import MessagePreviewDialog from "./message-preview-dialog";

export const columns: ColumnDef<
  BroadcastWithWhatsApp & { toContact: Contact[] }
>[] = [
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }).format(new Date(row.getValue("createdAt")));
    },
  },
  {
    accessorKey: "whatsApp.name",
    header: "Akun WhatsApp",
  },
  {
    accessorKey: "toContact",
    header: "Kontak",
    cell: ({ row }) => {
      return <ContactDialog contacts={row.original.toContact} />;
    },
  },
  {
    accessorKey: "id",
    header: "Pesan",
    cell: ({ row }) => {
      return (
        <MessagePreviewDialog
          message={row.original.message}
          rawMedia={row.original.rawMedia}
        />
      );
    },
  },
  {
    accessorKey: "errors",
    header: "Jumlah Error",
    cell: ({ row }) => {
      return row.original.errors.length;
    },
  },
  {
    accessorKey: "success",
    header: "Jumlah Sukses",
    cell: ({ row }) => {
      return row.original.success.length;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return row.original.status;
    },
  },
];
