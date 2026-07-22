import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppError } from "@/lib/api/app-error";

import { requireActiveProfile } from "./require-profile";

export async function requireActivePageProfile() {
  try {
    return await requireActiveProfile(await headers());
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }

    throw error;
  }
}
