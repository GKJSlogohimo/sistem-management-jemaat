import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/lib/env";

import prisma from "./prisma";

export const authProvisioning = betterAuth({
  appName: "Sistem Manajemen Jemaat",

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,

    /*
     * Instance ini tidak diekspos melalui Route Handler.
     */
    disableSignUp: false,

    /*
     * Jangan membuat session ketika admin membuat akun.
     */
    autoSignIn: false,

    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});
