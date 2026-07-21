import {
  Baby,
  BookOpen,
  CalendarDays,
  Church,
  GraduationCap,
  HandHeart,
  HeartPulse,
  type LucideIcon,
  Music,
  PartyPopper,
  Tags,
  Users,
} from "lucide-react";

import {
  type KategoriEventIconValue,
  kategoriEventIconValues,
} from "./schemas/kategori-event.schema";

export const kategoriEventIconOptions: Array<{
  value: KategoriEventIconValue;
  label: string;
}> = [
  {
    value: "CalendarDays",
    label: "Kalender",
  },
  {
    value: "Church",
    label: "Gereja",
  },
  {
    value: "HeartPulse",
    label: "Kesehatan",
  },
  {
    value: "GraduationCap",
    label: "Pendidikan",
  },
  {
    value: "Users",
    label: "Komunitas",
  },
  {
    value: "Baby",
    label: "Anak",
  },
  {
    value: "HandHeart",
    label: "Pelayanan sosial",
  },
  {
    value: "BookOpen",
    label: "Pembelajaran",
  },
  {
    value: "Music",
    label: "Musik",
  },
  {
    value: "PartyPopper",
    label: "Perayaan",
  },
];

const kategoriEventIconMap: Record<KategoriEventIconValue, LucideIcon> = {
  CalendarDays,
  Church,
  HeartPulse,
  GraduationCap,
  Users,
  Baby,
  HandHeart,
  BookOpen,
  Music,
  PartyPopper,
};

export function isKategoriEventIconValue(value: string): value is KategoriEventIconValue {
  return kategoriEventIconValues.includes(value as KategoriEventIconValue);
}

export function getKategoriEventIcon(value?: string | null): LucideIcon {
  if (value && isKategoriEventIconValue(value)) {
    return kategoriEventIconMap[value];
  }

  return Tags;
}
