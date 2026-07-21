import { apiFetch } from "@/lib/api/api-client";

import type { LaporanEvent } from "../types/laporan-event.types";

export function getLaporanEvent(eventId: string) {
  return apiFetch<LaporanEvent>(`/api/event/${eventId}/laporan`);
}
