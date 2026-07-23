import type { JenisBaptisan } from "@/generated/prisma/client";

export const jenisBaptisanOptions: {
  value: JenisBaptisan;
  label: string;
}[] = [
  {
    value: "BAPTIS_ANAK",
    label: "Baptis Anak",
  },
  {
    value: "BAPTIS_DEWASA",
    label: "Baptis Dewasa",
  },
  {
    value: "SIDI",
    label: "Sidi",
  },
];

export const jenisBaptisanLabels: Record<JenisBaptisan, string> = {
  BAPTIS_ANAK: "Baptis Anak",

  BAPTIS_DEWASA: "Baptis Dewasa",

  SIDI: "Sidi",
};
