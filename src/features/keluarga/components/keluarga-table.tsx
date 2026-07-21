"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
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
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";

import { useKeluargaQuery } from "../hooks/use-keluarga-query";
import type { KeluargaListItem } from "../types";
import { DeleteKeluargaDialog } from "./delete-keluarga-dialog";
import { getKeluargaColumns } from "./keluarga-columns";
import { KeluargaFormDialog } from "./keluarga-form-dialog";

const allowedSortFields = [
  "nomorKK",
  "namaKepalaKeluarga",
  "unitGereja",
  "createdAt",
  "updatedAt",
] as const;

type SortField = (typeof allowedSortFields)[number];

function isSortField(value: string): value is SortField {
  return allowedSortFields.includes(value as SortField);
}

export function KeluargaTable() {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [unitGerejaId, setUnitGerejaId] = useQueryState(
    "unitId",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    }),
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "namaKepalaKeluarga",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedKeluarga, setSelectedKeluarga] = useState<KeluargaListItem | null>(null);

  const unitOptionsQuery = useActiveUnitGerejaOptionsQuery();

  const activeSort = sorting[0];

  const sortBy = activeSort && isSortField(activeSort.id) ? activeSort.id : "namaKepalaKeluarga";

  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const query = useKeluargaQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    unitGerejaId: unitGerejaId || undefined,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      getKeluargaColumns({
        onEdit: (keluarga) => {
          setSelectedKeluarga(keluarga);
          setFormOpen(true);
        },

        onDelete: (keluarga) => {
          setSelectedKeluarga(keluarga);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;

    setSorting(nextSorting);

    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    });
  };

  const paginationMeta = query.data?.meta?.pagination;

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

  const data = query.data?.data ?? [];

  return (
    <>
      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Data tidak dapat dimuat</AlertTitle>

          <AlertDescription>{query.error.message}</AlertDescription>
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
        emptyMessage="Belum ada data keluarga."
        toolbar={() => (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nomor KK, kepala keluarga, atau alamat..."
              />

              <Select
                value={unitGerejaId || "all"}
                onValueChange={(value) => {
                  void setUnitGerejaId(value === "all" ? null : value);

                  onPaginationChange({
                    pageIndex: 0,
                    pageSize: pagination.pageSize,
                  });
                }}
                disabled={unitOptionsQuery.isPending}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Semua unit gereja" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua unit gereja</SelectItem>

                  {unitOptionsQuery.data?.data.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.kode} — {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => {
                setSelectedKeluarga(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Tambah Keluarga
            </Button>
          </div>
        )}
      />

      <KeluargaFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedKeluarga(null);
          }
        }}
        keluarga={selectedKeluarga}
      />

      <DeleteKeluargaDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedKeluarga(null);
          }
        }}
        keluarga={selectedKeluarga}
      />
    </>
  );
}
