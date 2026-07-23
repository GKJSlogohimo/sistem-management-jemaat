"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardSummaryRequest } from "../api/dashboard-api";
import { dashboardKeys } from "../dashboard-keys";

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummaryRequest,

    staleTime: 60_000,
    gcTime: 5 * 60_000,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    retry: 1,
  });
}
