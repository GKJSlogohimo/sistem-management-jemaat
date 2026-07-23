import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getJemaatList, getKeluargaOptions, getWilayahOptions } from "../api/jemaat.api";
import { jemaatKeys } from "../query-keys";
import type { JemaatListParams } from "../types";

export function useJemaatQuery(params: JemaatListParams) {
  return useQuery({
    queryKey: jemaatKeys.list(params),
    queryFn: () => getJemaatList(params),
    placeholderData: keepPreviousData,

    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useWilayahOptionsQuery(unitGerejaId?: string) {
  return useQuery({
    queryKey: jemaatKeys.wilayahOptions(unitGerejaId),
    queryFn: () => getWilayahOptions(unitGerejaId!),
    enabled: Boolean(unitGerejaId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useKeluargaOptionsQuery(unitGerejaId?: string) {
  return useQuery({
    queryKey: jemaatKeys.keluargaOptions(unitGerejaId),
    queryFn: () => getKeluargaOptions(unitGerejaId!),
    enabled: Boolean(unitGerejaId),
    staleTime: 5 * 60 * 1000,
  });
}
