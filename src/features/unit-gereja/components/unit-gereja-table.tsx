"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable, DataTableSearch, useDataTableQueryParams } from "@/components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useUnitGerejaQuery } from "../hooks/use-unit-gereja-query";
import type { UnitGerejaListItem } from "../types";
import { DeleteUnitGerejaDialog } from "./delete-unit-gereja-dialog";
import { getUnitGerejaColumns } from "./unit-gereja-columns";
import { UnitGerejaFormDialog } from "./unit-gereja-form-dialog";

const allowedSortFields = ["kode", "nama", "jenis", "aktif", "createdAt"] as const;

type SortField = (typeof allowedSortFields)[number];

function isSortField(value: string): value is SortField {
  return allowedSortFields.includes(value as SortField);
}

type UnitGerejaTableProps = {
  canManage: boolean;
};

export function UnitGerejaTable({ canManage }: UnitGerejaTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nama",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<UnitGerejaListItem | null>(null);

  const activeSort = sorting[0];

  const sortBy = activeSort && isSortField(activeSort.id) ? activeSort.id : "nama";

  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const query = useUnitGerejaQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      getUnitGerejaColumns({
        canManage,
        onEdit: (unit) => {
          setSelectedUnit(unit);
          setFormOpen(true);
        },

        onDelete: (unit) => {
          setSelectedUnit(unit);
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

  const data = query.data?.data ?? [];

  const paginationMeta = query.data?.meta?.pagination;

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
        emptyMessage="Belum ada data unit gereja."
        toolbar={() => (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTableSearch
              value={search}
              onValueChange={setSearch}
              onReset={resetSearch}
              placeholder="Cari kode, nama, atau alamat..."
            />

            {canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setSelectedUnit(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Tambah Unit Gereja
              </Button>
            ) : null}
          </div>
        )}
      />

      <UnitGerejaFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedUnit(null);
          }
        }}
        unit={selectedUnit}
      />

      <DeleteUnitGerejaDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedUnit(null);
          }
        }}
        unit={selectedUnit}
      />
    </>
  );
}
