import type { BaptisanListParams, JemaatBaptisanOptionsParams } from "./types";

export const baptisanKeys = {
  all: ["baptisan"] as const,

  lists: () => [...baptisanKeys.all, "list"] as const,

  list: (params: BaptisanListParams) => [...baptisanKeys.lists(), params] as const,

  details: () => [...baptisanKeys.all, "detail"] as const,

  detail: (id: string) => [...baptisanKeys.details(), id] as const,

  jemaatOptions: () => [...baptisanKeys.all, "jemaat-options"] as const,

  jemaatOption: (params: JemaatBaptisanOptionsParams) =>
    [...baptisanKeys.jemaatOptions(), params] as const,
};
