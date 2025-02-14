"use client";

import { Contact } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";
import { handleActionResponse } from "@/lib/utils";
import { deleteContactAction } from "./action";

export default function DeleteContactDialog({ contact }: { contact: Contact }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function onDelete() {
    startTransition(async () => {
      const response = await deleteContactAction(contact.id);
      handleActionResponse(response);
      setDialogOpen(false);
    });
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash />
          <span className="sr-only">Hapus</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Kontak</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus kontak {contact.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-10">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={onDelete}>
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
