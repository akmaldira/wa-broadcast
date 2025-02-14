import { object, string } from "zod";

export const registerSchema = object({
  name: string()
    .min(1, "Nama tidak boleh kosong")
    .max(255, "Nama terlalu panjang"),
  email: string()
    .min(1, "Email tidak boleh kosong")
    .max(255, "Email terlalu panjang")
    .email("Email tidak valid"),
  password: string()
    .min(1, "Password tidak boleh kosong")
    .max(255, "Password terlalu panjang"),
});
