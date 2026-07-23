import type { JemaatPernikahanOptionsParams, PernikahanListParams } from "./types";

export const pernikahanKeys = {
  all: ["pernikahan"] as const,

  lists: () => [...pernikahanKeys.all, "list"] as const,

  list: (params: PernikahanListParams) => [...pernikahanKeys.lists(), params] as const,

  details: () => [...pernikahanKeys.all, "detail"] as const,

  detail: (id: string) => [...pernikahanKeys.details(), id] as const,

  jemaatOptions: () => [...pernikahanKeys.all, "jemaat-options"] as const,

  jemaatOption: (params: JemaatPernikahanOptionsParams) =>
    [...pernikahanKeys.jemaatOptions(), params] as const,
};
