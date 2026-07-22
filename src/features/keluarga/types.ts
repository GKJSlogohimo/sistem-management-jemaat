import type { z } from "zod";

import type { ActiveUnitGerejaOption } from "@/features/unit-gereja/types";

import type { KeluargaListQuery } from "./schemas/keluarga.schema";
import { createKeluargaSchema, updateKeluargaSchema } from "./schemas/keluarga.schema";

export type KeluargaListItem = {
  id: string;
  unitGerejaId: string;
  nomorKK: string | null;
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
  nomorKK: string | null;
  namaKepalaKeluarga: string;
  unitGerejaId: string;
};

export type CreateKeluargaInput = z.infer<typeof createKeluargaSchema>;

export type UpdateKeluargaInput = z.infer<typeof updateKeluargaSchema>;

export type KeluargaListParams = KeluargaListQuery;
