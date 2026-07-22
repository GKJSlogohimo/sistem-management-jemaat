import "server-only";

import { redirect } from "next/navigation";

import type { AllowedRoles } from "./access-roles";
import { hasAnyRole } from "./access-roles";
import { requireActivePageProfile } from "./require-page-profile";

export async function requirePageRoles(allowedRoles: AllowedRoles) {
  const actor = await requireActivePageProfile();

  if (!hasAnyRole(actor.profile.peran, allowedRoles)) {
    redirect("/forbidden");
  }

  return actor;
}
