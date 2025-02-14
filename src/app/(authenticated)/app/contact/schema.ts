import { z } from "zod";

export const upsertContactSchema = z.object({
  id: z.optional(z.string()),
  name: z.optional(z.string()),
  phone: z
    .string()
    .min(1, "Nomor telepon tidak boleh kosong")
    .max(255, "Nomor telepon terlalu panjang"),
});
