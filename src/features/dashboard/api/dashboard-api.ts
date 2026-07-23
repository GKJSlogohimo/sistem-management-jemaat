import { apiFetch } from "@/lib/api/api-client";

import type { DashboardSummary } from "../types";

export function getDashboardSummaryRequest() {
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}
