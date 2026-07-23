import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getJemaatPenggunaOptions, getPenggunaList } from "../api/pengguna.api";
import { penggunaKeys } from "../query-keys";
import type { PenggunaListParams } from "../types";

export function usePenggunaQuery(params: PenggunaListParams) {
  return useQuery({
    queryKey: penggunaKeys.list(params),
    queryFn: () => getPenggunaList(params),
    placeholderData: keepPreviousData,

    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useJemaatPenggunaOptionsQuery(unitGerejaId?: string, userId?: string) {
  return useQuery({
    queryKey: penggunaKeys.jemaatOptions(unitGerejaId, userId),
    queryFn: () => getJemaatPenggunaOptions(unitGerejaId!, userId),
    enabled: Boolean(unitGerejaId),
    staleTime: 5 * 60 * 1000,
  });
}
