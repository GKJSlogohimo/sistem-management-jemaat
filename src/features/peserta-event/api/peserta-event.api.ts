import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreatePesertaEventInput,
  JemaatEventOption,
  PesertaEventDetail,
  PesertaEventListItem,
  PesertaEventListParams,
  UpdatePesertaEventInput,
} from "../types";

export function getPesertaEventList(eventId: string, params: PesertaEventListParams) {
  const searchParams = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.jenisPeserta) {
    searchParams.set("jenisPeserta", params.jenisPeserta);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return apiFetch<PesertaEventListItem[], PaginatedMeta>(
    `/api/event/${eventId}/peserta?${searchParams.toString()}`,
  );
}

export function getJemaatEventOptions(eventId: string, q: string) {
  const searchParams = new URLSearchParams({
    q,
  });

  return apiFetch<JemaatEventOption[]>(
    `/api/event/${eventId}/jemaat-options?${searchParams.toString()}`,
  );
}

export function createPesertaEventRequest(eventId: string, values: CreatePesertaEventInput) {
  return apiFetch<PesertaEventDetail>(`/api/event/${eventId}/peserta`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updatePesertaEventRequest(
  eventId: string,
  pesertaId: string,
  values: UpdatePesertaEventInput,
) {
  return apiFetch<PesertaEventDetail>(`/api/event/${eventId}/peserta/${pesertaId}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deletePesertaEventRequest(eventId: string, pesertaId: string) {
  return apiFetch<{
    id: string;
  }>(`/api/event/${eventId}/peserta/${pesertaId}`, {
    method: "DELETE",
  });
}
