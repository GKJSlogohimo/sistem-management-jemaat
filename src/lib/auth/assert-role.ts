import type { PeranPengguna } from "@/generated/prisma/enums";
import { AppError } from "@/lib/api/app-error";

import type { AllowedRoles } from "./access-roles";
import { hasAnyRole } from "./access-roles";

export function assertHasAnyRole(role: PeranPengguna, allowedRoles: AllowedRoles) {
  if (hasAnyRole(role, allowedRoles)) {
    return;
  }

  throw new AppError("Anda tidak memiliki hak akses untuk melakukan tindakan ini.", {
    status: 403,
    code: "FORBIDDEN",
  });
}
