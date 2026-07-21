import type { PeranPenggunaValue } from "./schemas/pengguna.schema";

export const peranPenggunaOptions: Array<{
  value: PeranPenggunaValue;
  label: string;
}> = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
  },
  {
    value: "ADMIN_INDUK",
    label: "Admin Induk",
  },
  {
    value: "ADMIN_SUB_INDUK",
    label: "Admin Subinduk",
  },
  {
    value: "SEKRETARIAT",
    label: "Sekretariat",
  },
  {
    value: "PANITIA_EVENT",
    label: "Panitia Event",
  },
  {
    value: "PETUGAS_REGISTRASI",
    label: "Petugas Registrasi",
  },
  {
    value: "PETUGAS_ANTREAN",
    label: "Petugas Antrean",
  },
  {
    value: "PELAYAN",
    label: "Pelayan",
  },
  {
    value: "VIEWER",
    label: "Viewer",
  },
];

export const peranPenggunaLabels: Record<PeranPenggunaValue, string> = Object.fromEntries(
  peranPenggunaOptions.map((option) => [option.value, option.label]),
) as Record<PeranPenggunaValue, string>;

export function roleRequiresUnit(role: PeranPenggunaValue) {
  return role !== "SUPER_ADMIN";
}
