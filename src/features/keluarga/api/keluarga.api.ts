import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateKeluargaInput,
  KeluargaDetail,
  KeluargaListItem,
  KeluargaListParams,
  UpdateKeluargaInput,
} from "../types";

export function getKeluargaList(params: KeluargaListParams) {
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

  return apiFetch<KeluargaListItem[], PaginatedMeta>(`/api/keluarga?${searchParams.toString()}`);
}

export function getKeluargaDetail(id: string) {
  return apiFetch<KeluargaDetail>(`/api/keluarga/${id}`);
}

export function createKeluargaRequest(values: CreateKeluargaInput) {
  return apiFetch<KeluargaDetail>("/api/keluarga", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateKeluargaRequest(id: string, values: UpdateKeluargaInput) {
  return apiFetch<KeluargaDetail>(`/api/keluarga/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteKeluargaRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/keluarga/${id}`, {
    method: "DELETE",
  });
}
