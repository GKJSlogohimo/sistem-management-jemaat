import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/lib/env";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  appName: "Sistem Manajemen Jemaat",

  baseURL: env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
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
