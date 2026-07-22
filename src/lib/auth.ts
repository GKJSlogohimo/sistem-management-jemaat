import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import { env } from "@/lib/env";
import prisma from "@/lib/prisma";

import { sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
  appName: "Sistem Manajemen Jemaat",

  baseURL: env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 30 * 60,

    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          const profile = await prisma.profilPengguna.findUnique({
            where: {
              userId: user.id,
            },

            select: {
              aktif: true,
            },
          });

          /*
           * Jangan kirim reset password
           * untuk akun yang tidak memiliki
           * profil atau sudah dinonaktifkan.
           */
          if (!profile?.aktif) {
            return;
          }

          await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl: url,
          });
        } catch (error) {
          /*
           * Jangan memasukkan resetUrl
           * atau token ke dalam log.
           */
          console.error("Gagal mengirim email reset kata sandi.", {
            userId: user.id,

            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    },
    onPasswordReset: async ({ user }) => {
      console.info("Kata sandi pengguna berhasil diatur ulang.", {
        userId: user.id,
      });
    },
  },

  experimental: {
    joins: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    // Harus menjadi plugin terakhir.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
