import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getKategoriEventList, getKategoriEventOptions } from "../api/kategori-event.api";
import { kategoriEventKeys } from "../query-keys";
import type { KategoriEventListParams } from "../types";

export function useKategoriEventQuery(params: KategoriEventListParams) {
  return useQuery({
    queryKey: kategoriEventKeys.list(params),

    queryFn: () => getKategoriEventList(params),

    placeholderData: keepPreviousData,

    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useKategoriEventOptionsQuery() {
  return useQuery({
    queryKey: kategoriEventKeys.options(),

    queryFn: getKategoriEventOptions,

    staleTime: 5 * 60 * 1000,
  });
}
