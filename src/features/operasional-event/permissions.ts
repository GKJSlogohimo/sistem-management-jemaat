import { PeranPengguna } from "@/generated/prisma/enums";
import { type AllowedRoles, EVENT_MANAGER_ROLES, hasAnyRole } from "@/lib/auth/access-roles";

import { ExecuteOperasionalEventInput } from "./types";

export type OperasionalEventAction = ExecuteOperasionalEventInput["action"];

export const OPERASIONAL_CHECK_IN_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
] as const;

export const OPERASIONAL_CALL_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_ANTREAN,
] as const;

export const OPERASIONAL_FINISH_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_ANTREAN,
  PeranPengguna.PELAYAN,
] as const;

export const OPERASIONAL_CANCEL_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
] as const;

const actionRoles: Record<OperasionalEventAction, AllowedRoles> = {
  CHECK_IN: OPERASIONAL_CHECK_IN_ROLES,

  PANGGIL: OPERASIONAL_CALL_ROLES,

  PANGGIL_BERIKUTNYA: OPERASIONAL_CALL_ROLES,

  KEMBALIKAN: OPERASIONAL_CALL_ROLES,

  SELESAI: OPERASIONAL_FINISH_ROLES,

  BATAL: OPERASIONAL_CANCEL_ROLES,
};

export function getOperasionalActionRoles(action: OperasionalEventAction) {
  return actionRoles[action];
}

export type OperasionalEventCapabilities = {
  canCheckIn: boolean;
  canCall: boolean;
  canReturn: boolean;
  canFinish: boolean;
  canCancel: boolean;
};

export function getOperasionalCapabilities(role: PeranPengguna): OperasionalEventCapabilities {
  return {
    canCheckIn: hasAnyRole(role, OPERASIONAL_CHECK_IN_ROLES),

    canCall: hasAnyRole(role, OPERASIONAL_CALL_ROLES),

    canReturn: hasAnyRole(role, OPERASIONAL_CALL_ROLES),

    canFinish: hasAnyRole(role, OPERASIONAL_FINISH_ROLES),

    canCancel: hasAnyRole(role, OPERASIONAL_CANCEL_ROLES),
  };
}
