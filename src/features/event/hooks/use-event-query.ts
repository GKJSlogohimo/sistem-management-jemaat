import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getEventDetail, getEventList } from "../api/event.api";
import { eventKeys } from "../query-keys";
import type { EventListParams } from "../types";

export function useEventQuery(params: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),

    queryFn: () => getEventList(params),

    placeholderData: keepPreviousData,
  });
}

export function useEventDetailQuery(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventDetail(id),
    enabled: Boolean(id),
  });
}
