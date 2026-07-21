import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getJemaatEventOptions, getPesertaEventList } from "../api/peserta-event.api";
import { pesertaEventKeys } from "../query-keys";
import type { PesertaEventListParams } from "../types";

export function usePesertaEventQuery(eventId: string, params: PesertaEventListParams) {
  return useQuery({
    queryKey: pesertaEventKeys.list(eventId, params),

    queryFn: () => getPesertaEventList(eventId, params),

    enabled: Boolean(eventId),

    placeholderData: keepPreviousData,
  });
}

export function useJemaatEventOptionsQuery(eventId: string, q: string, enabled = true) {
  return useQuery({
    queryKey: pesertaEventKeys.jemaatOptions(eventId, q),

    queryFn: () => getJemaatEventOptions(eventId, q),

    enabled: enabled && Boolean(eventId),

    staleTime: 30 * 1000,
  });
}
