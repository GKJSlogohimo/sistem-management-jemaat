import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreatePernikahanInput,
  JemaatPernikahanOption,
  JemaatPernikahanOptionsParams,
  PernikahanDetail,
  PernikahanListItem,
  PernikahanListParams,
  UpdatePernikahanInput,
} from "../types";

export function getPernikahanList(params: PernikahanListParams) {
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

  if (params.tanggalDari) {
    searchParams.set("tanggalDari", params.tanggalDari);
  }

  if (params.tanggalSampai) {
    searchParams.set("tanggalSampai", params.tanggalSampai);
  }

  return apiFetch<PernikahanListItem[], PaginatedMeta>(
    `/api/pernikahan?${searchParams.toString()}`,
  );
}

export function getPernikahanDetail(id: string) {
  return apiFetch<PernikahanDetail>(`/api/pernikahan/${id}`);
}

export function createPernikahanRequest(values: CreatePernikahanInput) {
  return apiFetch<PernikahanDetail>("/api/pernikahan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function updatePernikahanRequest(id: string, values: UpdatePernikahanInput) {
  return apiFetch<PernikahanDetail>(`/api/pernikahan/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function deletePernikahanRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/pernikahan/${id}`, {
    method: "DELETE",
  });
}

export function getJemaatPernikahanOptions(params: JemaatPernikahanOptionsParams) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.unitGerejaId) {
    searchParams.set("unitGerejaId", params.unitGerejaId);
  }

  if (params.currentPernikahanId) {
    searchParams.set("currentPernikahanId", params.currentPernikahanId);
  }

  return apiFetch<JemaatPernikahanOption[]>(
    `/api/pernikahan/jemaat-options?${searchParams.toString()}`,
  );
}
