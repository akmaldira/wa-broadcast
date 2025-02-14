import { z } from "zod";

export const addWhatsAppSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(255, "Nama terlalu panjang"),
});
