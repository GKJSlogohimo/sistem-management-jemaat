import { z } from "zod";

const passwordSchema = z
  .string()
  .min(1, "Kata sandi wajib diisi.")
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(128, "Kata sandi maksimal 128 karakter.");

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,

    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],

    message: "Konfirmasi kata sandi tidak sama.",
  });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
