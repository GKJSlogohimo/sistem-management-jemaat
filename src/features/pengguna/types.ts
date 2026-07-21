import type {
  CreatePenggunaInput,
  PenggunaListQuery,
  PeranPenggunaValue,
  UpdatePenggunaInput,
} from "./schemas/pengguna.schema";

export type PenggunaUnitReference = {
  id: string;
  kode: string;
  nama: string;
  jenis: "INDUK" | "SUB_INDUK";
};

export type PenggunaJemaatReference = {
  id: string;
  nomorIndukGereja: string;
  namaLengkap: string;
};

export type PenggunaListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;

  profilId: string | null;
  peran: PeranPenggunaValue | null;
  aktif: boolean;
  terkonfigurasi: boolean;

  unitGerejaId: string | null;
  jemaatId: string | null;

  unitGereja: PenggunaUnitReference | null;
  jemaat: PenggunaJemaatReference | null;

  jumlahSesiAktif: number;

  createdAt: string;
  updatedAt: string;
};

export type PenggunaDetail = PenggunaListItem;

export type JemaatPenggunaOption = {
  id: string;
  unitGerejaId: string;
  nomorIndukGereja: string;
  namaLengkap: string;
};

export type PenggunaListParams = PenggunaListQuery;

export type { CreatePenggunaInput, UpdatePenggunaInput };
