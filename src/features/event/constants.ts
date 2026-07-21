import type { JenisEventValue, StatusEventValue } from "./schemas/event.schema";

export const jenisEventOptions: Array<{
  value: JenisEventValue;
  label: string;
}> = [
  {
    value: "UMUM",
    label: "Umum",
  },
  {
    value: "REGISTRASI",
    label: "Registrasi",
  },
];

export const statusEventOptions: Array<{
  value: StatusEventValue;
  label: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "DIBUKA",
    label: "Dibuka",
  },
  {
    value: "DITUTUP",
    label: "Ditutup",
  },
  {
    value: "DIBATALKAN",
    label: "Dibatalkan",
  },
];

export const jenisEventLabels: Record<JenisEventValue, string> = {
  UMUM: "Umum",
  REGISTRASI: "Registrasi",
};

export const statusEventLabels: Record<StatusEventValue, string> = {
  DRAFT: "Draft",
  DIBUKA: "Dibuka",
  DITUTUP: "Ditutup",
  DIBATALKAN: "Dibatalkan",
};

export const eventStatusTransitions: Record<StatusEventValue, StatusEventValue[]> = {
  DRAFT: ["DRAFT", "DIBUKA", "DIBATALKAN"],

  DIBUKA: ["DIBUKA", "DITUTUP", "DIBATALKAN"],

  DITUTUP: ["DITUTUP"],
  DIBATALKAN: ["DIBATALKAN"],
};

export function toJakartaDateTimeInput(value: string) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
