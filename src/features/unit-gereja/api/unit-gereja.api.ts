import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateUnitGerejaInput,
  UnitGerejaDetail,
  UnitGerejaListItem,
  UnitGerejaListParams,
  UnitGerejaOption,
  UpdateUnitGerejaInput,
} from "../types";

export function getUnitGerejaList(params: UnitGerejaListParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  return apiFetch<UnitGerejaListItem[], PaginatedMeta>(`/api/unit-gereja?${searchParams}`);
}

export function getUnitGerejaDetail(id: string) {
  return apiFetch<UnitGerejaDetail>(`/api/unit-gereja/${id}`);
}

export function getUnitGerejaOptions() {
  return apiFetch<UnitGerejaOption[]>("/api/unit-gereja/options");
}

export function createUnitGerejaRequest(values: CreateUnitGerejaInput) {
  return apiFetch<UnitGerejaDetail>("/api/unit-gereja", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function updateUnitGerejaRequest(id: string, values: UpdateUnitGerejaInput) {
  return apiFetch<UnitGerejaDetail>(`/api/unit-gereja/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function deleteUnitGerejaRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/unit-gereja/${id}`, {
    method: "DELETE",
  });
}
