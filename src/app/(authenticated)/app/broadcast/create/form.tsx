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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Contact } from "@prisma/client";

export default function BroadcastForm({ contacts }: { contacts: Contact[] }) {
  const form = useForm<z.infer<typeof createBroadcastSchema>>({
    resolver: zodResolver(createBroadcastSchema),
    defaultValues: {
      toPhones: [],
      message: "",
      delay: 120,
    },
  });

  function onSubmit(values: z.infer<typeof createBroadcastSchema>) {
    console.log(values);
  }

  const delayState = form.watch("delay");

  const OPTIONS: Option[] = contacts.map((contact) => ({
    value: contact.phoneNumber.replace(/(\+|\s)/g, ""),
    label: contact.phoneNumber.replace(/(\+|\s)/g, ""),
  }));

  return (
    <Card className="w-full">
      <CardHeader>Buat Broadcast Baru</CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      placeholder="Cari nomor..."
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {...field}
                    />
                  </FormControl>
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
                        {...field}
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
              <Button type="submit" className="w-full">
                Kirim Broadcast
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
