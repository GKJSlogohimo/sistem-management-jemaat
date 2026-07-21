import type { WilayahFormValues, WilayahListQuery } from "./schemas/wilayah.schema";

export type UnitGerejaReference = {
  id: string;
  kode: string;
  nama: string;
  jenis: "INDUK" | "SUB_INDUK";
};

export type WilayahListItem = {
  id: string;
  unitGerejaId: string;
  nama: string;
  keterangan: string | null;
  unitGereja: UnitGerejaReference;
  jumlahJemaat: number;
  createdAt: string;
  updatedAt: string;
};

export type WilayahDetail = WilayahListItem;

export type UnitGerejaOption = UnitGerejaReference;

export type CreateWilayahInput = WilayahFormValues;

export type UpdateWilayahInput = WilayahFormValues;

export type WilayahListParams = WilayahListQuery;
