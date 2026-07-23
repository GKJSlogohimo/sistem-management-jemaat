import type { JemaatKematianOptionsParams, KematianListParams } from "./types";

export const kematianKeys = {
  all: ["kematian"] as const,

  lists: () => [...kematianKeys.all, "list"] as const,

  list: (params: KematianListParams) => [...kematianKeys.lists(), params] as const,

  details: () => [...kematianKeys.all, "detail"] as const,

  detail: (id: string) => [...kematianKeys.details(), id] as const,

  jemaatOptions: () => [...kematianKeys.all, "jemaat-options"] as const,

  jemaatOption: (params: JemaatKematianOptionsParams) =>
    [...kematianKeys.jemaatOptions(), params] as const,
};
