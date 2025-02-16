"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { DropzoneOptions } from "react-dropzone/.";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { bulkCreateContactSchema } from "./schema";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import DragAndDropArea from "@/components/drag-and-drop-area";
import { Paperclip } from "lucide-react";
import Link from "next/link";
import { cn, handleActionResponse } from "@/lib/utils";
import { bulkCreateContactAction } from "./action";

const dropzone = {
  multiple: false,
  maxFiles: 1,
  maxSize: 5 * 1024 * 1024,
  accept: {
    "text/csv": [".csv"],
  },
} satisfies DropzoneOptions;
export default function BulkCreateContactDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof bulkCreateContactSchema>>({
    resolver: zodResolver(bulkCreateContactSchema),
    defaultValues: {
      files: [],
    },
  });

  function onSubmit(values: z.infer<typeof bulkCreateContactSchema>) {
    startTransition(async () => {
      const response = await bulkCreateContactAction(values);
      handleActionResponse(response);
      form.setValue("files", []);
      setDialogOpen(false);
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Tambah Dari CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simpan kontak dari file CSV</DialogTitle>
          <DialogDescription>Pastikan format csv sudah benar</DialogDescription>
        </DialogHeader>
        <Link href="/template_kontak.csv" className={cn(buttonVariants())}>
          Download Template
        </Link>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File CSV</FormLabel>
                  <FileUploader
                    value={field.value || null}
                    onValueChange={field.onChange}
                    dropzoneOptions={dropzone}
                    className="relative bg-background rounded-lg p-2"
                  >
                    <FileInput
                      className="outline-dashed outline-1 outline-gray-500"
                      disabled={isPending}
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
            <div>
              <Button className="w-full">Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
