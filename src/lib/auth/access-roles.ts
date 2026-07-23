import { PeranPengguna } from "@/generated/prisma/enums";

export type AllowedRoles = readonly PeranPengguna[];

export function hasAnyRole(role: PeranPengguna, allowedRoles: AllowedRoles) {
  return allowedRoles.some((allowedRole) => allowedRole === role);
}

export const BAPTISAN_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PELAYAN,
  PeranPengguna.VIEWER,
] as const;

export const BAPTISAN_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PELAYAN,
] as const;

/*
 * Kelompok role yang dapat
 * mengelola Event.
 */
export const EVENT_MANAGER_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PANITIA_EVENT,
] as const;

/*
 * Unit Gereja
 */
export const UNIT_GEREJA_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.VIEWER,
] as const;

export const UNIT_GEREJA_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
] as const;

/*
 * Wilayah
 */
export const WILAYAH_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.VIEWER,
] as const;

export const WILAYAH_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
] as const;

/*
 * Keluarga
 */
export const KELUARGA_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PELAYAN,
  PeranPengguna.VIEWER,
] as const;

export const KELUARGA_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
] as const;

/*
 * Jemaat
 */
export const JEMAAT_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PELAYAN,
  PeranPengguna.VIEWER,
] as const;

export const JEMAAT_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
] as const;

/*
 * Manajemen Pengguna
 */
export const PENGGUNA_READ_ROLES = [PeranPengguna.SUPER_ADMIN, PeranPengguna.ADMIN_INDUK] as const;

export const PENGGUNA_WRITE_ROLES = [PeranPengguna.SUPER_ADMIN, PeranPengguna.ADMIN_INDUK] as const;

/*
 * Kategori Event
 */
export const KATEGORI_EVENT_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PANITIA_EVENT,
  PeranPengguna.VIEWER,
] as const;

export const KATEGORI_EVENT_WRITE_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PANITIA_EVENT,
] as const;

/*
 * Event
 */
export const EVENT_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.SEKRETARIAT,
  PeranPengguna.PANITIA_EVENT,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
  PeranPengguna.PELAYAN,
  PeranPengguna.VIEWER,
] as const;

export const EVENT_WRITE_ROLES = EVENT_MANAGER_ROLES;

/*
 * Pencatatan peserta Event.
 */
export const PESERTA_EVENT_WRITE_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_REGISTRASI,
] as const;

/*
 * Halaman operasional.
 *
 * VIEWER tidak memiliki akses karena
 * halaman ini mengubah status peserta.
 */
export const OPERASIONAL_EVENT_READ_ROLES = [
  ...EVENT_MANAGER_ROLES,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
  PeranPengguna.PELAYAN,
] as const;

export const IDENTITAS_SENSITIF_READ_ROLES = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.PANITIA_EVENT,
  PeranPengguna.PETUGAS_REGISTRASI,
  PeranPengguna.PETUGAS_ANTREAN,
  PeranPengguna.PELAYAN,
] as const;

export function canReadNik(role: PeranPengguna) {
  return hasAnyRole(role, IDENTITAS_SENSITIF_READ_ROLES);
}

export function canReadNomorKK(role: PeranPengguna) {
  return hasAnyRole(role, IDENTITAS_SENSITIF_READ_ROLES);
}
