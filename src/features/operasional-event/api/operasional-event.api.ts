import { apiFetch } from "@/lib/api/api-client";

import type {
  ExecuteOperasionalEventInput,
  OperasionalEventState,
  OperasionalParticipant,
} from "../types";

export function getOperasionalEventState(eventId: string, q: string) {
  const searchParams = new URLSearchParams({
    q,
  });

  return apiFetch<OperasionalEventState>(
    `/api/event/${eventId}/operasional?${searchParams.toString()}`,
  );
}

export function executeOperasionalEventAction(
  eventId: string,
  values: ExecuteOperasionalEventInput,
) {
  return apiFetch<OperasionalParticipant>(`/api/event/${eventId}/operasional`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}
