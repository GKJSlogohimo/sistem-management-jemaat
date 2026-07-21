import type { JenisPesertaValue, StatusPesertaEventValue } from "./schemas/peserta-event.schema";

export const jenisPesertaOptions: Array<{
  value: JenisPesertaValue;
  label: string;
}> = [
  {
    value: "JEMAAT",
    label: "Jemaat",
  },
  {
    value: "NON_JEMAAT",
    label: "Nonjemaat",
  },
];

export const statusPesertaEventOptions: Array<{
  value: StatusPesertaEventValue;
  label: string;
}> = [
  {
    value: "TERCATAT",
    label: "Tercatat",
  },
  {
    value: "HADIR",
    label: "Hadir",
  },
  {
    value: "MENUNGGU",
    label: "Menunggu",
  },
  {
    value: "DIPANGGIL",
    label: "Dipanggil",
  },
  {
    value: "SELESAI",
    label: "Selesai",
  },
  {
    value: "BATAL",
    label: "Batal",
  },
];

export const jenisPesertaLabels: Record<JenisPesertaValue, string> = {
  JEMAAT: "Jemaat",
  NON_JEMAAT: "Nonjemaat",
};

export const statusPesertaEventLabels: Record<StatusPesertaEventValue, string> = {
  TERCATAT: "Tercatat",
  HADIR: "Hadir",
  MENUNGGU: "Menunggu",
  DIPANGGIL: "Dipanggil",
  SELESAI: "Selesai",
  BATAL: "Batal",
};

export function formatParticipantTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
