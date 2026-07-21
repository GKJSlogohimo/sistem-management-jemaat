import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getKeluargaList } from "../api/keluarga.api";
import { keluargaKeys } from "../query-keys";
import type { KeluargaListParams } from "../types";

export function useKeluargaQuery(params: KeluargaListParams) {
  return useQuery({
    queryKey: keluargaKeys.list(params),

    queryFn: () => getKeluargaList(params),

    placeholderData: keepPreviousData,
  });
}
