import type {
  KategoriEventFormValues,
  KategoriEventListQuery,
} from "./schemas/kategori-event.schema";

export type KategoriEventListItem = {
  id: string;
  nama: string;
  ikon: string | null;
  warna: string | null;
  deskripsi: string | null;
  aktif: boolean;
  jumlahEvent: number;
  createdAt: string;
  updatedAt: string;
};

export type KategoriEventDetail = KategoriEventListItem;

export type KategoriEventOption = {
  id: string;
  nama: string;
  ikon: string | null;
  warna: string | null;
};

export type CreateKategoriEventInput = KategoriEventFormValues;

export type UpdateKategoriEventInput = KategoriEventFormValues;

export type KategoriEventListParams = KategoriEventListQuery;
