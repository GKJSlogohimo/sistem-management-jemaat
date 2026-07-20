import type {
  JenisUnitGerejaValue,
  UnitGerejaFormValues,
  UnitGerejaListQuery,
} from "./schemas/unit-gereja.schema";

export type UnitGerejaParent = {
  id: string;
  kode: string;
  nama: string;
};

export type UnitGerejaListItem = {
  id: string;
  kode: string;
  nama: string;
  jenis: JenisUnitGerejaValue;
  alamat: string | null;
  noHp: string | null;
  email: string | null;
  penanggungJawab: string | null;
  aktif: boolean;
  parentId: string | null;
  parent: UnitGerejaParent | null;
  createdAt: string;
  updatedAt: string;
};

export type UnitGerejaDetail = UnitGerejaListItem;

export type UnitGerejaOption = {
  id: string;
  kode: string;
  nama: string;
};

export type CreateUnitGerejaInput = UnitGerejaFormValues;

export type UpdateUnitGerejaInput = UnitGerejaFormValues;

export type UnitGerejaListParams = UnitGerejaListQuery;
