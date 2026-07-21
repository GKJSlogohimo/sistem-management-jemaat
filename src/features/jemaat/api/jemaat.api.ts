import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateJemaatInput,
  JemaatDetail,
  JemaatListItem,
  JemaatListParams,
  KeluargaOption,
  UpdateJemaatInput,
  WilayahOption,
} from "../types";

export function getJemaatList(params: JemaatListParams) {
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

  if (params.wilayahId) {
    searchParams.set("wilayahId", params.wilayahId);
  }

  if (params.jenisKelamin) {
    searchParams.set("jenisKelamin", params.jenisKelamin);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return apiFetch<JemaatListItem[], PaginatedMeta>(`/api/jemaat?${searchParams.toString()}`);
}

export function getWilayahOptions(unitGerejaId: string) {
  return apiFetch<WilayahOption[]>(`/api/wilayah/options?unitGerejaId=${unitGerejaId}`);
}

export function getKeluargaOptions(unitGerejaId: string) {
  return apiFetch<KeluargaOption[]>(`/api/keluarga/options?unitGerejaId=${unitGerejaId}`);
}

export function createJemaatRequest(values: CreateJemaatInput) {
  return apiFetch<JemaatDetail>("/api/jemaat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function updateJemaatRequest(id: string, values: UpdateJemaatInput) {
  return apiFetch<JemaatDetail>(`/api/jemaat/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function deleteJemaatRequest(id: string) {
  return apiFetch<{ id: string }>(`/api/jemaat/${id}`, {
    method: "DELETE",
  });
}
