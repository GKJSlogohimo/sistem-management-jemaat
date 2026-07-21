import type { PesertaEventListParams } from "./types";

export const pesertaEventKeys = {
  all: ["peserta-event"] as const,

  event: (eventId: string) => [...pesertaEventKeys.all, eventId] as const,

  lists: (eventId: string) => [...pesertaEventKeys.event(eventId), "list"] as const,

  list: (eventId: string, params: PesertaEventListParams) =>
    [...pesertaEventKeys.lists(eventId), params] as const,

  jemaatOptions: (eventId: string, q: string) =>
    [...pesertaEventKeys.event(eventId), "jemaat-options", q] as const,
};
