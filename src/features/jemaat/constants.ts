import type {
  AlasanTidakAktifValue,
  JenisKelaminValue,
  StatusJemaatValue,
} from "./schemas/jemaat.schema";

export const jenisKelaminOptions: Array<{
  value: JenisKelaminValue;
  label: string;
}> = [
  {
    value: "LAKI_LAKI",
    label: "Laki-laki",
  },
  {
    value: "PEREMPUAN",
    label: "Perempuan",
  },
];

export const statusJemaatOptions: Array<{
  value: StatusJemaatValue;
  label: string;
}> = [
  {
    value: "AKTIF",
    label: "Aktif",
  },
  {
    value: "TIDAK_AKTIF",
    label: "Tidak aktif",
  },
];

export const alasanTidakAktifOptions: Array<{
  value: Exclude<AlasanTidakAktifValue, "MENINGGAL">;
  label: string;
}> = [
  {
    value: "PINDAH_GEREJA",
    label: "Pindah gereja",
  },
  {
    value: "KELUAR_KEANGGOTAAN",
    label: "Keluar dari keanggotaan",
  },
  {
    value: "DATA_GANDA",
    label: "Data ganda",
  },
  {
    value: "LAINNYA",
    label: "Lainnya",
  },
];

export const jenisKelaminLabels: Record<JenisKelaminValue, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
};

export const statusJemaatLabels: Record<StatusJemaatValue, string> = {
  AKTIF: "Aktif",
  TIDAK_AKTIF: "Tidak aktif",
};

export const alasanTidakAktifLabels: Record<AlasanTidakAktifValue, string> = {
  MENINGGAL: "Meninggal",
  PINDAH_GEREJA: "Pindah gereja",
  KELUAR_KEANGGOTAAN: "Keluar dari keanggotaan",
  DATA_GANDA: "Data ganda",
  LAINNYA: "Lainnya",
};
