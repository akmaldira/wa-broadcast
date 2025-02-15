import { z } from "zod";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

export const createBroadcastSchema = z.object({
  whatsAppBot: z.object({
    id: z.string(),
    name: z.string(),
  }),
  toPhones: z.array(optionSchema).min(1, "Harus ada nomor tujuan"),
  message: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(1000, "Pesan terlalu panjang"),
  delay: z.coerce.number().min(0).max(600).default(120),
});
