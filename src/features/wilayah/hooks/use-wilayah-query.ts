import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getActiveUnitGerejaOptions, getWilayahList } from "../api/wilayah.api";
import { wilayahKeys } from "../query-keys";
import type { WilayahListParams } from "../types";

export function useWilayahQuery(params: WilayahListParams) {
  return useQuery({
    queryKey: wilayahKeys.list(params),
    queryFn: () => getWilayahList(params),
    placeholderData: keepPreviousData,
  });
}

export function useUnitGerejaOptionsQuery() {
  return useQuery({
    queryKey: wilayahKeys.unitOptions(),
    queryFn: getActiveUnitGerejaOptions,
    staleTime: 5 * 60 * 1000,
  });
}
