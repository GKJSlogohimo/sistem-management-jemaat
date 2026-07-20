"use client";

import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useDebounce } from "use-debounce";

import { dataTableSearchParams } from "./data-table-search-params";

const SEARCH_DEBOUNCE_MS = 400;

export function useDataTableQueryParams() {
  const [params, setParams] = useQueryStates(dataTableSearchParams, {
    history: "replace",
    shallow: true,
    clearOnDefault: true,
  });

  const [debouncedSearch] = useDebounce(params.q.trim(), SEARCH_DEBOUNCE_MS);

  const pagination: PaginationState = {
    pageIndex: params.page,
    pageSize: params.pageSize,
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const nextPagination = typeof updater === "function" ? updater(pagination) : updater;

    const pageSizeChanged = nextPagination.pageSize !== pagination.pageSize;

    void setParams({
      /*
       * Kembali ke halaman pertama ketika jumlah baris berubah.
       */
      page: pageSizeChanged ? 0 : nextPagination.pageIndex,

      pageSize: nextPagination.pageSize,
    });
  };

  function setSearch(value: string) {
    void setParams({
      q: value,

      /*
       * Pencarian baru harus mulai dari halaman pertama.
       */
      page: 0,
    });
  }

  function resetSearch() {
    void setParams({
      q: null,
      page: 0,
    });
  }

  return {
    search: params.q,
    debouncedSearch,
    pagination,
    setSearch,
    resetSearch,
    onPaginationChange,
  };
}
