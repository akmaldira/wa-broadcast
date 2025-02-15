"use server";

import { z } from "zod";
import { upsertContactSchema } from "./schema";
import { ServerAction } from "@/types/action";
import { Contact } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertContactAction(
  values: z.infer<typeof upsertContactSchema> & {
    countryCode: string;
    nationalNumber?: string;
    internationalNumber?: string;
  }
): Promise<ServerAction<Contact>> {
  try {
    let response: Contact;
    if (values.id) {
      response = await prisma.contact.update({
        where: { id: values.id },
        data: {
          name: values.name || null,
          countryCode: values.countryCode,
          phoneNumber: values.phone,
          nationalNumber: values.nationalNumber,
          internationalNumber: values.internationalNumber,
        },
      });
    } else {
      const isDuplicated = await prisma.contact.findUnique({
        where: {
          phoneNumber: values.phone,
        },
      });
      if (isDuplicated) {
        return {
          status: "error",
          error: "Kontak sudah ada",
        };
      }
      response = await prisma.contact.create({
        data: {
          name: values.name || null,
          countryCode: values.countryCode,
          phoneNumber: values.phone,
          nationalNumber: values.nationalNumber,
          internationalNumber: values.internationalNumber,
        },
      });
    }

    revalidatePath("/app/contact");
    return {
      status: "success",
      data: response,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

export async function deleteContactAction(
  id: string
): Promise<ServerAction<void>> {
  try {
    await prisma.contact.delete({
      where: { id: id },
    });
    revalidatePath("/app/contact");
    return {
      status: "success",
      data: undefined,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
