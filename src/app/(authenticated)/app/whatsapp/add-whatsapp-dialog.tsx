"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { addWhatsAppSchema } from "./schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWhatsAppBotAction } from "./action";
import { handleActionResponse } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AddWhatsAppDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof addWhatsAppSchema>>({
    resolver: zodResolver(addWhatsAppSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof addWhatsAppSchema>) {
    startTransition(async () => {
      const response = await createWhatsAppBotAction(values);
      const data = handleActionResponse(response);
      form.reset();
      setDialogOpen(false);
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Tambah WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah WhatsApp</DialogTitle>
          <DialogDescription>
            Silakan tambahkan WhatsApp untuk broadcast pesan atau mengirim
            pesan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akun</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama akun whatsapp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Tambah WhatsApp
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
