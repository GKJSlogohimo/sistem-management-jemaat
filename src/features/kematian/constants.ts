import type { StatusPencatatanKematian } from "@/generated/prisma/enums";

export const statusKematianLabels = {
  DRAFT: "Draft",
  TERVERIFIKASI: "Terverifikasi",
  DIBATALKAN: "Dibatalkan",
} satisfies Record<StatusPencatatanKematian, string>;

export const statusKematianOptions = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "TERVERIFIKASI",
    label: "Terverifikasi",
  },
  {
    value: "DIBATALKAN",
    label: "Dibatalkan",
  },
] satisfies Array<{
  value: StatusPencatatanKematian;
  label: string;
}>;
