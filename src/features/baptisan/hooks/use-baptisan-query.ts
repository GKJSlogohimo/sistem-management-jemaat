"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getBaptisanDetail, getBaptisanList, getJemaatBaptisanOptions } from "../api/baptisan-api";
import { baptisanKeys } from "../baptisan-keys";
import type { BaptisanListParams, JemaatBaptisanOptionsParams } from "../types";

export function useBaptisanQuery(params: BaptisanListParams) {
  return useQuery({
    queryKey: baptisanKeys.list(params),

    queryFn: () => getBaptisanList(params),

    placeholderData: keepPreviousData,
  });
}

export function useBaptisanDetailQuery(id: string | null) {
  return useQuery({
    queryKey: baptisanKeys.detail(id ?? ""),

    queryFn: () => getBaptisanDetail(id!),

    enabled: Boolean(id),
  });
}

export function useJemaatBaptisanOptionsQuery(params: JemaatBaptisanOptionsParams, enabled = true) {
  return useQuery({
    queryKey: baptisanKeys.jemaatOption(params),

    queryFn: () => getJemaatBaptisanOptions(params),

    enabled,
  });
}
