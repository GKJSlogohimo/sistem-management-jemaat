import type { ActiveUnitGerejaOption } from "@/features/unit-gereja/types";

import type { KeluargaFormValues, KeluargaListQuery } from "./schemas/keluarga.schema";

export type KeluargaListItem = {
  id: string;
  unitGerejaId: string;
  nomorKK: string;
  namaKepalaKeluarga: string;
  alamat: string | null;
  noHp: string | null;
  unitGereja: ActiveUnitGerejaOption;
  jumlahAnggota: number;
  createdAt: string;
  updatedAt: string;
};

export type KeluargaDetail = KeluargaListItem;

export type KeluargaOption = {
  id: string;
  nomorKK: string;
  namaKepalaKeluarga: string;
  unitGerejaId: string;
};

export type CreateKeluargaInput = KeluargaFormValues;

export type UpdateKeluargaInput = KeluargaFormValues;

export type KeluargaListParams = KeluargaListQuery;
