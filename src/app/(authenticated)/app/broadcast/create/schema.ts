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
  media: z.optional(
    z
      .array(
        z.instanceof(File).refine((file) => file.size < 5 * 1024 * 1024, {
          message: "Maksimal 5MB",
        })
      )
      .max(5, {
        message: "Maksimal 5 media",
      })
  ),
  delay: z.coerce.number().min(0).max(600).default(120),
});
