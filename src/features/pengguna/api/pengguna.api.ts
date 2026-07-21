import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreatePenggunaInput,
  JemaatPenggunaOption,
  PenggunaDetail,
  PenggunaListItem,
  PenggunaListParams,
  UpdatePenggunaInput,
} from "../types";

export function getPenggunaList(params: PenggunaListParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.peran) {
    searchParams.set("peran", params.peran);
  }

  if (params.aktif !== undefined) {
    searchParams.set("aktif", String(params.aktif));
  }

  if (params.unitGerejaId) {
    searchParams.set("unitGerejaId", params.unitGerejaId);
  }

  return apiFetch<PenggunaListItem[], PaginatedMeta>(`/api/pengguna?${searchParams.toString()}`);
}

export function createPenggunaRequest(values: CreatePenggunaInput) {
  return apiFetch<PenggunaDetail>("/api/pengguna", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function updatePenggunaRequest(id: string, values: UpdatePenggunaInput) {
  return apiFetch<PenggunaDetail>(`/api/pengguna/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function deactivatePenggunaRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/pengguna/${id}`, {
    method: "DELETE",
  });
}

export function getJemaatPenggunaOptions(unitGerejaId: string, userId?: string) {
  const searchParams = new URLSearchParams({
    unitGerejaId,
  });

  if (userId) {
    searchParams.set("userId", userId);
  }

  return apiFetch<JemaatPenggunaOption[]>(`/api/pengguna/jemaat-options?${searchParams}`);
}
