import "server-only";

import type { AllowedRoles } from "./access-roles";
import { assertHasAnyRole } from "./assert-role";
import { requireActiveProfile } from "./require-profile";

export async function requireApiRoles(requestHeaders: Headers, allowedRoles: AllowedRoles) {
  const actor = await requireActiveProfile(requestHeaders);

  assertHasAnyRole(actor.profile.peran, allowedRoles);

  return actor;
}
