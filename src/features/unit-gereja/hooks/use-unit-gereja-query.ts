import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getUnitGerejaList, getUnitGerejaOptions } from "../api/unit-gereja.api";
import { unitGerejaKeys } from "../query-keys";
import type { UnitGerejaListParams } from "../types";

export function useUnitGerejaQuery(params: UnitGerejaListParams) {
  return useQuery({
    queryKey: unitGerejaKeys.list(params),
    queryFn: () => getUnitGerejaList(params),
    placeholderData: keepPreviousData,
  });
}

export function useUnitGerejaOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: unitGerejaKeys.options(),
    queryFn: getUnitGerejaOptions,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
