import type {
  AlasanTidakAktifValue,
  JemaatFormValues,
  JemaatListQuery,
  JenisKelaminValue,
  StatusJemaatValue,
} from "./schemas/jemaat.schema";

export type UnitGerejaReference = {
  id: string;
  kode: string;
  nama: string;
};

export type WilayahReference = {
  id: string;
  nama: string;
};

export type KeluargaReference = {
  id: string;
  nomorKK: string;
  namaKepalaKeluarga: string;
};

export type WilayahOption = {
  id: string;
  unitGerejaId: string;
  nama: string;
};

export type KeluargaOption = {
  id: string;
  unitGerejaId: string;
  nomorKK: string;
  namaKepalaKeluarga: string;
};

export type JemaatListItem = {
  id: string;
  nomorIndukGereja: string;
  nik: string;
  namaLengkap: string;
  namaPanggilan: string | null;
  jenisKelamin: JenisKelaminValue;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  alamat: string | null;
  noHp: string | null;
  email: string | null;
  foto: string | null;

  status: StatusJemaatValue;
  tanggalTidakAktif: string | null;
  alasanTidakAktif: AlasanTidakAktifValue | null;
  keteranganTidakAktif: string | null;

  unitGerejaId: string;
  wilayahId: string;
  keluargaId: string;

  unitGereja: UnitGerejaReference;
  wilayah: WilayahReference;
  keluarga: KeluargaReference;

  createdAt: string;
  updatedAt: string;
};

export type JemaatDetail = JemaatListItem;

export type JemaatListParams = JemaatListQuery;
export type CreateJemaatInput = JemaatFormValues;
export type UpdateJemaatInput = JemaatFormValues;
