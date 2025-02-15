"use client";

import { WhatsAppWithData } from "@/types/prisma";
import { ColumnDef } from "@tanstack/react-table";
import QRCodeDialog from "./qr-code-dialog";
import DeleteWhatsAppDialog from "./delete-whatsapp-dialog";

export const columns: ColumnDef<WhatsAppWithData>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "qrCode",
    header: "Login QR Code",
    cell: ({ row }) => {
      return (
        <QRCodeDialog whatsApp={row.original} qrCode={row.original.qrCode} />
      );
    },
  },
  {
    accessorKey: "id",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <DeleteWhatsAppDialog whatsApp={row.original} />
        </div>
      );
    },
  },
];
