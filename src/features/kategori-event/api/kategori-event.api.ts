import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateKategoriEventInput,
  KategoriEventDetail,
  KategoriEventListItem,
  KategoriEventListParams,
  KategoriEventOption,
  UpdateKategoriEventInput,
} from "../types";

export function getKategoriEventList(params: KategoriEventListParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.aktif !== undefined) {
    searchParams.set("aktif", String(params.aktif));
  }

  return apiFetch<KategoriEventListItem[], PaginatedMeta>(
    `/api/kategori-event?${searchParams.toString()}`,
  );
}

export function getKategoriEventDetail(id: string) {
  return apiFetch<KategoriEventDetail>(`/api/kategori-event/${id}`);
}

export function getKategoriEventOptions() {
  return apiFetch<KategoriEventOption[]>("/api/kategori-event/options");
}

export function createKategoriEventRequest(values: CreateKategoriEventInput) {
  return apiFetch<KategoriEventDetail>("/api/kategori-event", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateKategoriEventRequest(id: string, values: UpdateKategoriEventInput) {
  return apiFetch<KategoriEventDetail>(`/api/kategori-event/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteKategoriEventRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/kategori-event/${id}`, {
    method: "DELETE",
  });
}
