import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email tidak boleh kosong")
    .max(255, "Email terlalu panjang")
    .email(),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .max(255, "Password terlalu panjang"),
});
