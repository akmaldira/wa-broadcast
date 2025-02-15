"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createBroadcastSchema } from "./schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Contact } from "@prisma/client";
import React from "react";
import { getWhatsAppWithBotsAction } from "./action";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Paperclip, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropzoneOptions } from "react-dropzone/.";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import DragAndDropArea from "@/components/drag-and-drop-area";

function SubmitAlert({
  onSubmit,
  form,
  isPending,
}: {
  onSubmit: (values: z.infer<typeof createBroadcastSchema>) => void;
  isPending: boolean;
  form: UseFormReturn<
    {
      whatsAppBot: {
        id: string;
        name: string;
      };
      toPhones: {
        value: string;
        label: string;
        disable?: boolean | undefined;
      }[];
      message: string;
      delay: number;
      media?: File[];
    },
    any,
    undefined
  >;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (open) {
          form.trigger().then(setDialogOpen);
          return;
        }
        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" className="w-full" disabled={isPending}>
          Kirim Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apakah data berikut sudah benar?</DialogTitle>
          <DialogDescription>
            Pastikan data-data berikut sudah benar sebelum mengirim broadcast
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex gap-2 items-center">
              <h1>WhatsApp Bot : </h1>
              <p>{form.getValues("whatsAppBot.name")}</p>
            </div>
            <div>
              <h1>Nomor Tujuan : </h1>
              <div className="">
                {form.getValues("toPhones").map((phone) => (
                  <Badge key={phone.value} className="m-1">
                    {phone.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h1>Pesan : </h1>
              <p>{form.getValues("message")}</p>
            </div>
            <div>
              <h1>Delay : </h1>
              <p>{form.getValues("delay")} detik</p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex gap-2 items-center mt-8">
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => setDialogOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="w-full"
            onClick={async () => {
              await form.trigger();
              if (form.formState.isValid) {
                onSubmit(form.getValues());
                setDialogOpen(false);
              }
            }}
            disabled={isPending}
          >
            Kirim Broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const dropzone = {
  multiple: false,
  maxFiles: 1,
  maxSize: 5 * 1024 * 1024,
  accept: {
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
  },
} satisfies DropzoneOptions;

export default function BroadcastForm({ contacts }: { contacts: Contact[] }) {
  const [isPending, startTransition] = React.useTransition();
  const [whatsAppBots, setWhatsAppBots] = React.useState<
    {
      qrCode: string | undefined;
      status: "unknown" | "connecting" | "connected" | "disconnected";
      name: string;
      id: string;
      apiKey: string;
      reachReconnectLimit: boolean;
      isActive: boolean;
    }[]
  >([]);
  const [abortController, setAbortController] = React.useState<
    AbortController | undefined
  >(undefined);
  const [responseText, setResponseText] = React.useState("");
  const form = useForm<z.infer<typeof createBroadcastSchema>>({
    resolver: zodResolver(createBroadcastSchema),
    defaultValues: {
      whatsAppBot: undefined,
      toPhones: [],
      message: "",
      media: undefined,
      delay: 120,
    },
  });

  function getWhatsAppWithBots() {
    startTransition(async () => {
      const response = await getWhatsAppWithBotsAction();
      if (response.status === "error") {
        toast.error(response.error);
        return;
      }
      setWhatsAppBots(response.data);
    });
  }

  React.useEffect(() => {
    getWhatsAppWithBots();
  }, []);

  function onSubmit(values: z.infer<typeof createBroadcastSchema>) {
    let controller = abortController ? abortController : new AbortController();
    if (!abortController) setAbortController(controller);
    startTransition(async () => {
      const loadingToast = toast.loading("Mengirim broadcast, mohon tunggu...");
      try {
        const formData = new FormData();
        formData.append("whatsAppBotId", values.whatsAppBot.id);
        formData.append(
          "toPhones",
          values.toPhones.map((phone) => phone.label).join(",")
        );
        formData.append("message", values.message);
        formData.append("delay", values.delay.toString());
        if (values.media && values.media.length > 0) {
          if (values.media.length > 1) {
            toast.error("Maksimal 1 media");
            return;
          }
          formData.append("media", values.media[0]);
        }
        const response = await fetch("/api2/whatsapp/send-message", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          toast.error(data.error);
          return;
        }
        const reader = response.body?.getReader();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const responseStream = new TextDecoder().decode(value);
            const chunks = responseStream.split("\n");
            for (const chunk of chunks) {
              if (!chunk) continue;
              try {
                const responseJSON = JSON.parse(chunk);
                console.log(responseJSON);
                if ("percentage" in responseJSON && "message" in responseJSON) {
                  setResponseText(
                    `${responseJSON.message} (Progress: ${responseJSON.percentage})`
                  );
                }
              } catch (error) {
                setResponseText(chunk);
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          toast.error("Broadcast dihentikan");
          return;
        }
        toast.error(error.message);
      } finally {
        toast.dismiss(loadingToast);
        setAbortController(undefined);
      }
    });
  }

  const delayState = form.watch("delay");

  const OPTIONS: Option[] = contacts.map((contact) => ({
    value: contact.id,
    label: contact.phoneNumber.replaceAll(" ", ""),
  }));

  return (
    <Card className="w-full">
      <CardHeader>Buat Broadcast Baru</CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="whatsAppBot.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Bot</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      form.clearErrors();
                      field.onChange(value);
                      const selectedWhatsApp = whatsAppBots.find(
                        (bot) => bot.id === value
                      );
                      if (selectedWhatsApp) {
                        form.setValue("whatsAppBot", {
                          id: selectedWhatsApp.id,
                          name: selectedWhatsApp.name,
                        });
                      }
                    }}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih WhatsApp Bot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {whatsAppBots.length > 0 ? (
                        whatsAppBots.map((bot) => (
                          <SelectItem key={bot.id} value={bot.id}>
                            {bot.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full py-4">
                          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                            Tidak ada WhatsApp Bot yang tersedia
                          </p>
                          <Link
                            href="/app/whatsapp"
                            className={cn(buttonVariants())}
                          >
                            <Plus className="mx-auto h-4 w-4" />
                            Tambah WhatsApp Bot
                          </Link>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormField
                control={form.control}
                name="toPhones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Tujuan</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        {...field}
                        defaultOptions={OPTIONS}
                        disabled={isPending}
                        placeholder="Cari nomor..."
                        onChange={(options) => {
                          form.clearErrors();
                          field.onChange(options);
                        }}
                        emptyIndicator={
                          <div>
                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                              Tidak ada kontak yang ditemukan.
                            </p>
                            <Link
                              href="/app/contact"
                              className={cn(buttonVariants())}
                            >
                              <Plus className="mx-auto h-4 w-4" />
                              Tambah Kontak
                            </Link>
                          </div>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    form.setValue(
                      "toPhones",
                      OPTIONS.map((option) => ({
                        ...option,
                      }))
                    );
                  }}
                >
                  Pilih Semua
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <AutosizeTextarea
                      placeholder="Pesan yang akan di broadcast"
                      minHeight={50}
                      disabled={isPending}
                      {...field}
                      onChange={(values) => {
                        form.clearErrors();
                        field.onChange(values);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media (opsional)</FormLabel>
                  <FileUploader
                    value={field.value || null}
                    onValueChange={field.onChange}
                    dropzoneOptions={dropzone}
                    className="relative bg-background rounded-lg p-2"
                  >
                    <FileInput
                      disabled={isPending}
                      className="outline-dashed outline-1 outline-white"
                    >
                      <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                        <DragAndDropArea
                          acceptExtensions={Object.values(dropzone.accept)
                            .flatMap((ext) => ext)
                            .map((ext) => ext.substring(1).toUpperCase())}
                        />
                      </div>
                    </FileInput>
                    <FileUploaderContent>
                      {field.value &&
                        field.value.length > 0 &&
                        field.value.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <Paperclip className="h-4 w-4 stroke-current" />
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                    </FileUploaderContent>
                  </FileUploader>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="delay"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Delay (dalam detik)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Delay setiap nomor (dalam detik)"
                        min={0}
                        max={600}
                        type="number"
                        className="w-full"
                        disabled={isPending}
                        {...field}
                        onChange={(values) => {
                          form.clearErrors();
                          field.onChange(values);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                {delayState} detik / {(delayState / 60).toFixed(2)} menit /{" "}
                {(delayState / 60 / 60).toFixed(2)} jam
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-center py-2">
                {responseText}
              </p>
              <div className="flex items-center w-full gap-2">
                <SubmitAlert
                  form={form}
                  onSubmit={onSubmit}
                  isPending={isPending}
                />
                {/* {abortController && (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() =>
                      abortController?.abort("Broadcast dihentikan")
                    }
                  >
                    <StopCircle />
                    Hentikan Broadcast
                  </Button>
                )} */}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
