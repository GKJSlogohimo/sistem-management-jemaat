import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import prisma from "@/lib/prisma";

import { sendPasswordResetEmail } from "./email";

const betterAuthUrl = process.env.BETTER_AUTH_URL;

if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL belum dikonfigurasi.");
}

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET belum dikonfigurasi.");
}

const productionHost = new URL(betterAuthUrl).host;

export const auth = betterAuth({
  appName: "Sistem Manajemen Jemaat",

  baseURL: {
    allowedHosts: ["localhost:3000", productionHost, "*.vercel.app"],

    protocol: "auto",
    fallback: betterAuthUrl,
  },

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
    cookieCache: {
      enabled: true,

      // Session diverifikasi ulang ke database setiap 60 detik.
      maxAge: 60,

      // Format paling kecil dan cepat untuk pemakaian internal.
      strategy: "compact",
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    // Harus menjadi plugin terakhir.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
