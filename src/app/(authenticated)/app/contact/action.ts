"use server";

import { z } from "zod";
import { bulkCreateContactSchema, upsertContactSchema } from "./schema";
import { ServerAction } from "@/types/action";
import { Contact } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import csv from "csv-parser";
import { Readable } from "stream";
import { getPhoneDataServer } from "@/lib/utils";

export async function upsertContactAction(
  values: z.infer<typeof upsertContactSchema> & {
    countryCode: string;
    nationalNumber?: string;
    internationalNumber?: string;
  }
): Promise<ServerAction<Contact>> {
  try {
    const session = await auth();
    const userSession = session?.user;
    if (!session || !userSession) {
      return {
        status: "error",
        error: "Silakan login terlebih dahulu",
        redirect: "/login",
      };
    }

    if (!["ROOT", "ADMIN"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }
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
    const session = await auth();
    const userSession = session?.user;
    if (!session || !userSession) {
      return {
        status: "error",
        error: "Silakan login terlebih dahulu",
        redirect: "/login",
      };
    }

    if (!["ROOT", "ADMIN"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }
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

export async function bulkCreateContactAction(
  values: z.infer<typeof bulkCreateContactSchema>
): Promise<ServerAction<Contact[]>> {
  try {
    const session = await auth();
    const userSession = session?.user;
    if (!session || !userSession) {
      return {
        status: "error",
        error: "Silakan login terlebih dahulu",
        redirect: "/login",
      };
    }

    if (!["ROOT", "ADMIN"].includes(userSession.role)) {
      return {
        status: "error",
        error: "Anda tidak punya akses mengakses aksi ini",
      };
    }

    const file = values.files[0];
    if (!file) {
      return {
        status: "error",
        error: "File tidak ditemukan",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const bufferStream = new Readable();
    bufferStream.push(Buffer.from(arrayBuffer)); // Convert ArrayBuffer to Buffer
    bufferStream.push(null); // Indicate end of the stream

    const results: Omit<Contact, "id" | "createdAt" | "updatedAt">[] = [];
    let errors = 0;
    await new Promise((resolve) => {
      bufferStream
        .pipe(csv())
        .on("data", (data) => {
          const phoneStr = data["Nomor HP"] as string;
          const phoneData = getPhoneDataServer(
            phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`
          );

          results.push({
            name: null,
            countryCode: phoneData.countryCode || "",
            phoneNumber: phoneData.internationalNumber || "",
            nationalNumber: phoneData.nationalNumber || "",
            internationalNumber: phoneData.internationalNumber || "",
          });
        })
        .on("end", () => {
          resolve("DONE");
        })
        .on("error", (err) => {
          console.log(err);
          errors++;
        });
    });
    const contacts = await prisma.contact.createManyAndReturn({
      data: results,
    });

    const success = contacts.length;
    revalidatePath("/app/contact");
    return {
      status: "success",
      data: contacts,
      message: `${success} Success and ${errors} Error`,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
