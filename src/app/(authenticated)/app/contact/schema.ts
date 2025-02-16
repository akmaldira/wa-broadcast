import { z } from "zod";

export const upsertContactSchema = z.object({
  id: z.optional(z.string()),
  name: z.optional(z.string()),
  phone: z
    .string()
    .min(1, "Nomor telepon tidak boleh kosong")
    .max(255, "Nomor telepon terlalu panjang"),
});

export const bulkCreateContactSchema = z.object({
  files: z
    .array(
      z.instanceof(File).refine((file) => file.size < 5 * 1024 * 1024, {
        message: "Maksimal 5MB",
      })
    )
    .max(1, {
      message: "Maksimal 1 file",
    }),
});
