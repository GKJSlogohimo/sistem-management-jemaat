import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateWilayahInput,
  UnitGerejaOption,
  UpdateWilayahInput,
  WilayahDetail,
  WilayahListItem,
  WilayahListParams,
} from "../types";

export function getWilayahList(params: WilayahListParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.unitGerejaId) {
    searchParams.set("unitGerejaId", params.unitGerejaId);
  }

  return apiFetch<WilayahListItem[], PaginatedMeta>(`/api/wilayah?${searchParams.toString()}`);
}

export function getWilayahDetail(id: string) {
  return apiFetch<WilayahDetail>(`/api/wilayah/${id}`);
}

export function getActiveUnitGerejaOptions() {
  return apiFetch<UnitGerejaOption[]>("/api/unit-gereja/active-options");
}

export function createWilayahRequest(values: CreateWilayahInput) {
  return apiFetch<WilayahDetail>("/api/wilayah", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateWilayahRequest(id: string, values: UpdateWilayahInput) {
  return apiFetch<WilayahDetail>(`/api/wilayah/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteWilayahRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/wilayah/${id}`, {
    method: "DELETE",
  });
}
