import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateKematianInput,
  JemaatKematianOption,
  JemaatKematianOptionsParams,
  KematianDetail,
  KematianListItem,
  KematianListParams,
  UpdateKematianInput,
} from "../types";

export function getKematianList(params: KematianListParams) {
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

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.tanggalDari) {
    searchParams.set("tanggalDari", params.tanggalDari);
  }

  if (params.tanggalSampai) {
    searchParams.set("tanggalSampai", params.tanggalSampai);
  }

  return apiFetch<KematianListItem[], PaginatedMeta>(`/api/kematian?${searchParams.toString()}`);
}

export function getKematianDetail(id: string) {
  return apiFetch<KematianDetail>(`/api/kematian/${id}`);
}

export function createKematianRequest(values: CreateKematianInput) {
  return apiFetch<KematianDetail>("/api/kematian", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateKematianRequest(id: string, values: UpdateKematianInput) {
  return apiFetch<KematianDetail>(`/api/kematian/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteKematianRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/kematian/${id}`, {
    method: "DELETE",
  });
}

export function getJemaatKematianOptions(params: JemaatKematianOptionsParams) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.unitGerejaId) {
    searchParams.set("unitGerejaId", params.unitGerejaId);
  }

  if (params.currentKematianId) {
    searchParams.set("currentKematianId", params.currentKematianId);
  }

  return apiFetch<JemaatKematianOption[]>(
    `/api/kematian/jemaat-options?${searchParams.toString()}`,
  );
}
