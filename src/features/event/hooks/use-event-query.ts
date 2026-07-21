import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getEventList } from "../api/event.api";
import { eventKeys } from "../query-keys";
import type { EventListParams } from "../types";

export function useEventQuery(params: EventListParams) {
  return useQuery({
    queryKey: eventKeys.list(params),

    queryFn: () => getEventList(params),

    placeholderData: keepPreviousData,
  });
}
