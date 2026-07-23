import type { StatusPencatatanKematian } from "@/generated/prisma/client";

import type { CreateKematianInput, UpdateKematianInput } from "./schemas/kematian.schema";

export type { CreateKematianInput, UpdateKematianInput };

export type KematianSortBy =
  | "namaJemaat"
  | "tanggalMeninggal"
  | "umurSaatMeninggal"
  | "nomorSuratKematian"
  | "status"
  | "unitGereja"
  | "createdAt"
  | "updatedAt";

export type KematianListParams = {
  q: string;
  page: number;
  pageSize: number;

  unitGerejaId?: string;
  status?: StatusPencatatanKematian;

  tanggalDari?: string;
  tanggalSampai?: string;

  sortBy: KematianSortBy;
  sortOrder: "asc" | "desc";
};

export type KematianJemaatSummary = {
  id: string;
  unitGerejaId: string;
  nomorIndukGereja: string;
  namaLengkap: string;
  tanggalLahir: string | null;
  foto: string | null;

  wilayah: {
    id: string;
    nama: string;
  };

  keluarga: {
    id: string;
    namaKepalaKeluarga: string;
  };

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };
};

export type KematianListItem = {
  id: string;
  jemaatId: string;
  unitGerejaId: string;

  tanggalMeninggal: string;
  waktuMeninggal: string | null;
  tempatMeninggal: string | null;
  penyebabKematian: string | null;
  umurSaatMeninggal: number | null;

  nomorSuratKematian: string | null;
  instansiPenerbit: string | null;
  dokumenSuratKematian: string | null;
  alamatRumahDuka: string | null;

  tanggalIbadahPenghiburan: string | null;
  waktuIbadahPenghiburan: string | null;
  lokasiIbadahPenghiburan: string | null;
  namaPelayanPenghiburan: string | null;
  temaPelayanan: string | null;
  catatanPelayanan: string | null;

  tanggalPemakaman: string | null;
  waktuPemakaman: string | null;
  lokasiPemakaman: string | null;
  namaTempatPemakaman: string | null;
  namaPelayanPemakaman: string | null;
  nomorLokasiMakam: string | null;
  keteranganPemakaman: string | null;

  status: StatusPencatatanKematian;
  keterangan: string | null;

  jemaat: KematianJemaatSummary;

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };

  createdAt: string;
  updatedAt: string;
};

export type KematianDetail = KematianListItem;

export type JemaatKematianOption = {
  id: string;
  unitGerejaId: string;
  nomorIndukGereja: string;
  namaLengkap: string;
  tanggalLahir: string | null;

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };
};

export type JemaatKematianOptionsParams = {
  q?: string;
  unitGerejaId?: string;
  currentKematianId?: string;
};
