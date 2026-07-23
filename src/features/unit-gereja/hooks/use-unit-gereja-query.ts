import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getActiveUnitGerejaOptions,
  getUnitGerejaList,
  getUnitGerejaOptions,
} from "../api/unit-gereja.api";
import { unitGerejaKeys } from "../query-keys";
import type { UnitGerejaListParams } from "../types";

export function useUnitGerejaQuery(params: UnitGerejaListParams) {
  return useQuery({
    queryKey: unitGerejaKeys.list(params),
    queryFn: () => getUnitGerejaList(params),
    placeholderData: keepPreviousData,

    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useUnitGerejaOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: unitGerejaKeys.options(),
    queryFn: getUnitGerejaOptions,
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useActiveUnitGerejaOptionsQuery() {
  return useQuery({
    queryKey: unitGerejaKeys.activeOptions(),
    queryFn: getActiveUnitGerejaOptions,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
  });
}
