"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getJemaatPernikahanOptions,
  getPernikahanDetail,
  getPernikahanList,
} from "../api/pernikahan-api";
import { pernikahanKeys } from "../pernikahan-keys";
import type { JemaatPernikahanOptionsParams, PernikahanListParams } from "../types";

export function usePernikahanQuery(params: PernikahanListParams) {
  return useQuery({
    queryKey: pernikahanKeys.list(params),
    queryFn: () => getPernikahanList(params),
    placeholderData: keepPreviousData,
  });
}

export function usePernikahanDetailQuery(id: string | null) {
  return useQuery({
    queryKey: pernikahanKeys.detail(id ?? ""),
    queryFn: () => getPernikahanDetail(id!),
    enabled: Boolean(id),
  });
}

export function useJemaatPernikahanOptionsQuery(
  params: JemaatPernikahanOptionsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: pernikahanKeys.jemaatOption(params),
    queryFn: () => getJemaatPernikahanOptions(params),
    enabled,
  });
}
