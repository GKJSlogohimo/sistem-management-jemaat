import { PeranPengguna } from "@/generated/prisma/enums";
import { AppError } from "@/lib/api/app-error";

const ADMIN_INDUK_ASSIGNABLE_ROLES = [
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PANITIA_EVENT,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
  PeranPengguna.PELAYAN,
  PeranPengguna.VIEWER,
] as const;

export function assertCanAssignUserRole(actorRole: PeranPengguna, targetRole: PeranPengguna) {
  if (actorRole === PeranPengguna.SUPER_ADMIN) {
    return;
  }

  if (
    actorRole === PeranPengguna.ADMIN_INDUK &&
    ADMIN_INDUK_ASSIGNABLE_ROLES.some((role) => role === targetRole)
  ) {
    return;
  }

  throw new AppError("Anda tidak dapat memberikan role tersebut.", {
    status: 403,
    code: "UNAUTHORIZED",
  });
}
