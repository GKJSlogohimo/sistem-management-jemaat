import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  BaptisanDetail,
  BaptisanListItem,
  BaptisanListParams,
  CreateBaptisanInput,
  JemaatBaptisanOption,
  JemaatBaptisanOptionsParams,
  UpdateBaptisanInput,
} from "../types";

export function getBaptisanList(params: BaptisanListParams) {
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

  if (params.jenis) {
    searchParams.set("jenis", params.jenis);
  }

  if (params.tanggalDari) {
    searchParams.set("tanggalDari", params.tanggalDari);
  }

  if (params.tanggalSampai) {
    searchParams.set("tanggalSampai", params.tanggalSampai);
  }

  return apiFetch<BaptisanListItem[], PaginatedMeta>(`/api/baptisan?${searchParams.toString()}`);
}

export function getBaptisanDetail(id: string) {
  return apiFetch<BaptisanDetail>(`/api/baptisan/${id}`);
}

export function createBaptisanRequest(values: CreateBaptisanInput) {
  return apiFetch<BaptisanDetail>("/api/baptisan", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateBaptisanRequest(id: string, values: UpdateBaptisanInput) {
  return apiFetch<BaptisanDetail>(`/api/baptisan/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteBaptisanRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/baptisan/${id}`, {
    method: "DELETE",
  });
}

export function getJemaatBaptisanOptions(params: JemaatBaptisanOptionsParams) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.unitGerejaId) {
    searchParams.set("unitGerejaId", params.unitGerejaId);
  }

  if (params.jenis) {
    searchParams.set("jenis", params.jenis);
  }

  if (params.currentBaptisanId) {
    searchParams.set("currentBaptisanId", params.currentBaptisanId);
  }

  return apiFetch<JemaatBaptisanOption[]>(
    `/api/baptisan/jemaat-options?${searchParams.toString()}`,
  );
}
