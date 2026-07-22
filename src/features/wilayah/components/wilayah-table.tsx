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

import { useUnitGerejaOptionsQuery, useWilayahQuery } from "../hooks/use-wilayah-query";
import type { WilayahListItem } from "../types";
import { DeleteWilayahDialog } from "./delete-wilayah-dialog";
import { getWilayahColumns } from "./wilayah-columns";
import { WilayahFormDialog } from "./wilayah-form-dialog";

const allowedSortFields = ["nama", "unitGereja", "createdAt", "updatedAt"] as const;

type SortField = (typeof allowedSortFields)[number];

function isSortField(value: string): value is SortField {
  return allowedSortFields.includes(value as SortField);
}

type WilayahTableProps = {
  canManage: boolean;
};

export function WilayahTable({ canManage }: WilayahTableProps) {
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
      id: "nama",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedWilayah, setSelectedWilayah] = useState<WilayahListItem | null>(null);

  const unitOptionsQuery = useUnitGerejaOptionsQuery();

  const activeSort = sorting[0];

  const sortBy = activeSort && isSortField(activeSort.id) ? activeSort.id : "nama";

  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const query = useWilayahQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    unitGerejaId: unitGerejaId || undefined,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      getWilayahColumns({
        canManage,
        onEdit: (wilayah) => {
          setSelectedWilayah(wilayah);
          setFormOpen(true);
        },

        onDelete: (wilayah) => {
          setSelectedWilayah(wilayah);
          setDeleteOpen(true);
        },
      }),
    [canManage],
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

  /*
   * Kembali ke halaman terakhir yang tersedia
   * apabila data pada halaman aktif habis setelah delete.
   */
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
        emptyMessage="Belum ada data wilayah."
        toolbar={() => (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari wilayah atau unit gereja..."
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

            {canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setSelectedWilayah(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Tambah Wilayah
              </Button>
            ) : null}
          </div>
        )}
      />

      <WilayahFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedWilayah(null);
          }
        }}
        wilayah={selectedWilayah}
      />

      <DeleteWilayahDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedWilayah(null);
          }
        }}
        wilayah={selectedWilayah}
      />
    </>
  );
}
