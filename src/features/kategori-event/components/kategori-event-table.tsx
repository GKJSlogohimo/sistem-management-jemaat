"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

import { DataTable, DataTableSearch, useDataTableQueryParams } from "@/components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useKategoriEventQuery } from "../hooks/use-kategori-event-query";
import type { KategoriEventListItem } from "../types";
import { DeleteKategoriEventDialog } from "./delete-kategori-event-dialog";
import { getKategoriEventColumns } from "./kategori-event-columns";
import { KategoriEventFormDialog } from "./kategori-event-form-dialog";

const statusValues = ["active", "inactive"] as const;

type StatusFilter = (typeof statusValues)[number];

const allowedSortFields = ["nama", "aktif", "createdAt", "updatedAt"] as const;

type SortField = (typeof allowedSortFields)[number];

function isSortField(value: string): value is SortField {
  return allowedSortFields.includes(value as SortField);
}

type KategoriEventTableProps = {
  canManage: boolean;
};
export function KategoriEventTable({ canManage }: KategoriEventTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringEnum<StatusFilter>([...statusValues]).withOptions({
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    }),
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nama",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedKategori, setSelectedKategori] = useState<KategoriEventListItem | null>(null);

  const activeSort = sorting[0];

  const sortBy = activeSort && isSortField(activeSort.id) ? activeSort.id : "nama";

  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const query = useKategoriEventQuery({
    q: debouncedSearch,

    page: pagination.pageIndex + 1,

    pageSize: pagination.pageSize,

    aktif: status === "active" ? true : status === "inactive" ? false : undefined,

    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      getKategoriEventColumns({
        canManage,
        onEdit: (kategori) => {
          setSelectedKategori(kategori);

          setFormOpen(true);
        },

        onDelete: (kategori) => {
          setSelectedKategori(kategori);

          setDeleteOpen(true);
        },
      }),
    [canManage],
  );

  const paginationMeta = query.data?.meta?.pagination;

  const data = query.data?.data ?? [];

  const hasActiveFilters = Boolean(search) || Boolean(status);

  function resetPage() {
    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    });
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;

    setSorting(nextSorting);
    resetPage();
  };

  function handleResetFilters() {
    resetSearch();
    void setStatus(null);
    resetPage();
  }

  useEffect(() => {
    if (query.isFetching || !paginationMeta || paginationMeta.totalPages === 0) {
      return;
    }

    if (pagination.pageIndex < paginationMeta.totalPages) {
      return;
    }

    onPaginationChange({
      pageIndex: paginationMeta.totalPages - 1,

      pageSize: pagination.pageSize,
    });
  }, [
    onPaginationChange,
    pagination.pageIndex,
    pagination.pageSize,
    paginationMeta,
    query.isFetching,
  ]);

  return (
    <>
      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Data tidak dapat dimuat</AlertTitle>

          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{query.error.message}</span>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void query.refetch();
              }}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={paginationMeta?.totalPages ?? 0}
        totalItems={paginationMeta?.total ?? 0}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={query.isPending}
        emptyMessage="Belum ada Kategori Event."
        toolbar={() => (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama atau deskripsi..."
              />

              <Select
                value={status ?? "all"}
                onValueChange={(value) => {
                  void setStatus(value === "all" ? null : (value as StatusFilter));

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full sm:w-45">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>

                  <SelectItem value="active">Aktif</SelectItem>

                  <SelectItem value="inactive">Tidak aktif</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="justify-start sm:self-center"
                >
                  <RotateCcw />
                  Reset filter
                </Button>
              ) : null}
            </div>

            {canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setSelectedKategori(null);

                  setFormOpen(true);
                }}
              >
                <Plus />
                Tambah Kategori
              </Button>
            ) : null}
          </div>
        )}
      />

      <KategoriEventFormDialog
        open={formOpen}
        kategori={selectedKategori}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedKategori(null);
          }
        }}
      />

      <DeleteKategoriEventDialog
        open={deleteOpen}
        kategori={selectedKategori}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedKategori(null);
          }
        }}
      />
    </>
  );
}
