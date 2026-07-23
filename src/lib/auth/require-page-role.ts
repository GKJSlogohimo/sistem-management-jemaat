import "server-only";

import { redirect } from "next/navigation";

import { type AllowedRoles, hasAnyRole } from "@/lib/auth/access-roles";

import { getCurrentPageAuth } from "./get-current-page-auth";

export async function requireAuthenticatedPage() {
  const authContext = await getCurrentPageAuth();

  if (!authContext) {
    redirect("/login");
  }

  return authContext;
}

export async function requirePageRoles(allowedRoles: AllowedRoles) {
  const authContext = await requireAuthenticatedPage();

  if (!hasAnyRole(authContext.profile.peran, allowedRoles)) {
    redirect("/forbidden");
  }

  return authContext;
}
