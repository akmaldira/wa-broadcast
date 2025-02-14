"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { upsertContactSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Contact } from "@prisma/client";
import { getPhoneData, PhoneInput } from "@/components/phone-input";
import { handleActionResponse } from "@/lib/utils";
import { upsertContactAction } from "./action";

export default function UpsertContactDialog({
  contact,
}: {
  contact?: Contact;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof upsertContactSchema>>({
    resolver: zodResolver(upsertContactSchema),
    defaultValues: {
      id: contact?.id || undefined,
      name: contact?.name || "",
      phone: contact?.phoneNumber || "",
    },
  });

  function onSubmit(values: z.infer<typeof upsertContactSchema>) {
    startTransition(async () => {
      const phoneData = getPhoneData(values.phone);
      if (!phoneData.isValid) {
        form.setError("phone", {
          message: "Nomor telepon tidak valid",
        });
        return;
      }

      const response = await upsertContactAction({
        id: values.id,
        name: values.name,
        phone: values.phone,
        countryCode: phoneData.countryCode || "",
        nationalNumber: phoneData.nationalNumber || "",
        internationalNumber: phoneData.internationalNumber || "",
      });
      handleActionResponse(response);
      form.reset();
      setDialogOpen(false);
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size={contact ? "icon" : "default"}>
          {contact ? (
            <Pencil />
          ) : (
            <>
              <Plus />
              Tambah Kontak
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Ubah Kontak" : "Tambah Kontak"}</DialogTitle>
          <DialogDescription>
            Silakan isi form di bawah ini untuk {contact ? "ubah" : "tambah"}
            kontak
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama kontak</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama kontak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor telepon</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="Masukkan nomor telepon"
                      defaultCountry="ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
