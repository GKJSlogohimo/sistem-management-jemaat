import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),

  password: z
    .string()
    .min(1, "Kata sandi wajib diisi.")
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(128, "Kata sandi maksimal 128 karakter."),

  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama lengkap wajib diisi.")
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(100, "Nama lengkap maksimal 100 karakter."),

    email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),

    password: z
      .string()
      .min(1, "Kata sandi wajib diisi.")
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(128, "Kata sandi maksimal 128 karakter."),

    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
