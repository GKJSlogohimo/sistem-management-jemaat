"use client";

import { useQuery } from "@tanstack/react-query";

import { getLaporanEvent } from "../api/laporan-event.api";
import { laporanEventKeys } from "../query-keys";

export function useLaporanEvent(eventId: string) {
  return useQuery({
    queryKey: laporanEventKeys.detail(eventId),

    queryFn: () => getLaporanEvent(eventId),

    enabled: Boolean(eventId),

    staleTime: 30_000,
  });
}
