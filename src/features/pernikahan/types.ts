import type { CreatePernikahanInput, UpdatePernikahanInput } from "./schemas/pernikahan.schema";

export type { CreatePernikahanInput, UpdatePernikahanInput };

export type PernikahanSortBy =
  | "namaPihakSatu"
  | "namaPihakDua"
  | "tanggalPernikahan"
  | "nomorPencatatan"
  | "nomorSertifikat"
  | "unitGereja"
  | "createdAt"
  | "updatedAt";

export type PernikahanListParams = {
  q: string;
  page: number;
  pageSize: number;

  unitGerejaId?: string;
  tanggalDari?: string;
  tanggalSampai?: string;

  sortBy: PernikahanSortBy;
  sortOrder: "asc" | "desc";
};

export type PernikahanJemaatSummary = {
  id: string;
  unitGerejaId: string;
  nomorIndukGereja: string;
  namaLengkap: string;

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };
};

export type PernikahanListItem = {
  id: string;
  unitGerejaId: string;

  nomorPencatatan: string | null;
  nomorSertifikat: string | null;

  tanggalPernikahan: string;
  tempatPernikahan: string | null;
  namaPelayan: string | null;

  jemaatPihakSatuId: string | null;
  namaPihakSatu: string;
  jemaatPihakSatu: PernikahanJemaatSummary | null;

  jemaatPihakDuaId: string | null;
  namaPihakDua: string;
  jemaatPihakDua: PernikahanJemaatSummary | null;

  namaSaksiSatu: string | null;
  namaSaksiDua: string | null;

  dokumen: string | null;
  keterangan: string | null;

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };

  createdAt: string;
  updatedAt: string;
};

export type PernikahanDetail = PernikahanListItem;

export type JemaatPernikahanOption = {
  id: string;
  unitGerejaId: string;
  nomorIndukGereja: string;
  namaLengkap: string;

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };
};

export type JemaatPernikahanOptionsParams = {
  q?: string;
  unitGerejaId?: string;
  currentPernikahanId?: string;
};
