import type { EventListParams } from "./types";

export const eventKeys = {
  all: ["event"] as const,

  lists: () => [...eventKeys.all, "list"] as const,

  list: (params: EventListParams) => [...eventKeys.lists(), params] as const,

  details: () => [...eventKeys.all, "detail"] as const,

  detail: (id: string) => [...eventKeys.details(), id] as const,
};
