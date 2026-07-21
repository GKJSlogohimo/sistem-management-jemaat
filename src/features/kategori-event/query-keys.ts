import type { KategoriEventListParams } from "./types";

export const kategoriEventKeys = {
  all: ["kategori-event"] as const,

  lists: () => [...kategoriEventKeys.all, "list"] as const,

  list: (params: KategoriEventListParams) => [...kategoriEventKeys.lists(), params] as const,

  details: () => [...kategoriEventKeys.all, "detail"] as const,

  detail: (id: string) => [...kategoriEventKeys.details(), id] as const,

  options: () => [...kategoriEventKeys.all, "options"] as const,
};
