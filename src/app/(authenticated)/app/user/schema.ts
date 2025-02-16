import { $Enums } from "@prisma/client";
import { z } from "zod";

export const addUserSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(255, "Nama terlalu panjang"),
  email: z
    .string()
    .min(1, "Email harus diisi")
    .max(255, "Email terlalu panjang")
    .email("Email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .max(255, "Password terlalu panjang"),
  role: z.nativeEnum($Enums.UserRole, {
    errorMap: () => ({ message: "Role tidak valid" }),
  }),
});
