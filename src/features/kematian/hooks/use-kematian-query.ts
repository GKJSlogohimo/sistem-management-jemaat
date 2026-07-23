"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getJemaatKematianOptions, getKematianDetail, getKematianList } from "../api/kematian-api";
import { kematianKeys } from "../kematian-keys";
import type { JemaatKematianOptionsParams, KematianListParams } from "../types";

export function useKematianQuery(params: KematianListParams) {
  return useQuery({
    queryKey: kematianKeys.list(params),
    queryFn: () => getKematianList(params),
    placeholderData: keepPreviousData,
  });
}

export function useKematianDetailQuery(id: string | null) {
  return useQuery({
    queryKey: kematianKeys.detail(id ?? ""),
    queryFn: () => getKematianDetail(id!),
    enabled: Boolean(id),
  });
}

export function useJemaatKematianOptionsQuery(params: JemaatKematianOptionsParams, enabled = true) {
  return useQuery({
    queryKey: kematianKeys.jemaatOption(params),
    queryFn: () => getJemaatKematianOptions(params),
    enabled,
  });
}
