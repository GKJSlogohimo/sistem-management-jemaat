import { apiFetch } from "@/lib/api/api-client";
import type { PaginatedMeta } from "@/lib/api/api-types";

import type {
  CreateEventInput,
  EventDetail,
  EventListItem,
  EventListParams,
  UpdateEventInput,
} from "../types";

export function getEventList(params: EventListParams) {
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

  if (params.kategoriEventId) {
    searchParams.set("kategoriEventId", params.kategoriEventId);
  }

  if (params.jenis) {
    searchParams.set("jenis", params.jenis);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return apiFetch<EventListItem[], PaginatedMeta>(`/api/event?${searchParams.toString()}`);
}

export function createEventRequest(values: CreateEventInput) {
  return apiFetch<EventDetail>("/api/event", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function updateEventRequest(id: string, values: UpdateEventInput) {
  return apiFetch<EventDetail>(`/api/event/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(values),
  });
}

export function deleteEventRequest(id: string) {
  return apiFetch<{
    id: string;
  }>(`/api/event/${id}`, {
    method: "DELETE",
  });
}
