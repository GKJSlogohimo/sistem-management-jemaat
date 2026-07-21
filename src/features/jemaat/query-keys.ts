import type { JemaatListParams } from "./types";

export const jemaatKeys = {
  all: ["jemaat"] as const,

  lists: () => [...jemaatKeys.all, "list"] as const,

  list: (params: JemaatListParams) => [...jemaatKeys.lists(), params] as const,

  details: () => [...jemaatKeys.all, "detail"] as const,

  detail: (id: string) => [...jemaatKeys.details(), id] as const,

  wilayahOptions: (unitGerejaId?: string) =>
    [...jemaatKeys.all, "wilayah-options", unitGerejaId ?? "none"] as const,

  keluargaOptions: (unitGerejaId?: string) =>
    [...jemaatKeys.all, "keluarga-options", unitGerejaId ?? "none"] as const,
};
