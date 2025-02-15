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
import { Badge } from "@/components/ui/badge";

export default function ContactDialog({ contacts }: { contacts: Contact[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Lihat Kontak</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kontak</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Badge key={contact.id} className="m-1">
              {contact.phoneNumber.replaceAll(" ", "")}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
