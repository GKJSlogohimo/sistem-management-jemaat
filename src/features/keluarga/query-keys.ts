import type { KeluargaListParams } from "./types";

export const keluargaKeys = {
  all: ["keluarga"] as const,

  lists: () => [...keluargaKeys.all, "list"] as const,

  list: (params: KeluargaListParams) => [...keluargaKeys.lists(), params] as const,

  details: () => [...keluargaKeys.all, "detail"] as const,

  detail: (id: string) => [...keluargaKeys.details(), id] as const,

  options: (unitGerejaId?: string) =>
    [...keluargaKeys.all, "options", unitGerejaId ?? "all"] as const,
};
