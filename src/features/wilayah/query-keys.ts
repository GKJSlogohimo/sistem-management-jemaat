import type { WilayahListParams } from "./types";

export const wilayahKeys = {
  all: ["wilayah"] as const,

  lists: () => [...wilayahKeys.all, "list"] as const,

  list: (params: WilayahListParams) => [...wilayahKeys.lists(), params] as const,

  details: () => [...wilayahKeys.all, "detail"] as const,

  detail: (id: string) => [...wilayahKeys.details(), id] as const,

  unitOptions: () => [...wilayahKeys.all, "unit-options"] as const,
};
