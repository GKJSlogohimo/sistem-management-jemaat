import type { UnitGerejaListParams } from "./types";

export const unitGerejaKeys = {
  all: ["unit-gereja"] as const,

  lists: () => [...unitGerejaKeys.all, "list"] as const,

  list: (params: UnitGerejaListParams) => [...unitGerejaKeys.lists(), params] as const,

  details: () => [...unitGerejaKeys.all, "detail"] as const,

  detail: (id: string) => [...unitGerejaKeys.details(), id] as const,

  options: () => [...unitGerejaKeys.all, "options"] as const,
};
