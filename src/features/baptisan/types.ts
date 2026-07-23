import type { JenisBaptisan } from "@/generated/prisma/client";

import type { CreateBaptisanInput, UpdateBaptisanInput } from "./schemas/baptisan.schema";

export type { CreateBaptisanInput, UpdateBaptisanInput };

export type BaptisanSortBy =
  | "namaJemaat"
  | "jenis"
  | "tanggalBaptisan"
  | "nomorSertifikat"
  | "unitGereja"
  | "createdAt"
  | "updatedAt";

export type BaptisanListParams = {
  q: string;
  page: number;
  pageSize: number;

  unitGerejaId?: string;
  jenis?: JenisBaptisan;
  tanggalDari?: string;
  tanggalSampai?: string;

  sortBy: BaptisanSortBy;
  sortOrder: "asc" | "desc";
};

export type BaptisanListItem = {
  id: string;
  jemaatId: string;
  unitGerejaId: string;

  jenis: JenisBaptisan;
  tanggalBaptisan: string;

  tempatBaptisan: string | null;
  namaPelayan: string | null;
  nomorSertifikat: string | null;
  dokumen: string | null;
  keterangan: string | null;

  jemaat: {
    id: string;
    nomorIndukGereja: string;
    namaLengkap: string;
  };

  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };

  createdAt: string;
  updatedAt: string;
};

export type BaptisanDetail = BaptisanListItem;

export type JemaatBaptisanOption = {
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

export type JemaatBaptisanOptionsParams = {
  q?: string;
  unitGerejaId?: string;
  jenis?: JenisBaptisan;
  currentBaptisanId?: string;
};
