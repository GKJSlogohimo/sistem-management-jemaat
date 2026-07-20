import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import prisma from "@/lib/prisma";

export const auth = betterAuth({
  appName: "Sistem Manajemen Jemaat",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    // Harus diletakkan sebagai plugin terakhir.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
