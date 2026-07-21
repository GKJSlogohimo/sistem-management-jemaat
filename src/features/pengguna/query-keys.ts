import type { PenggunaListParams } from "./types";

export const penggunaKeys = {
  all: ["pengguna"] as const,

  lists: () => [...penggunaKeys.all, "list"] as const,

  list: (params: PenggunaListParams) => [...penggunaKeys.lists(), params] as const,

  details: () => [...penggunaKeys.all, "detail"] as const,

  detail: (id: string) => [...penggunaKeys.details(), id] as const,

  jemaatOptions: (unitGerejaId?: string, userId?: string) =>
    [...penggunaKeys.all, "jemaat-options", unitGerejaId ?? "none", userId ?? "new"] as const,
};
