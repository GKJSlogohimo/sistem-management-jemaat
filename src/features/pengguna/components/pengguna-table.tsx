"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
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

import { peranPenggunaOptions } from "../constants";
import { usePenggunaQuery } from "../hooks/use-pengguna-query";
import type { PeranPenggunaValue } from "../schemas/pengguna.schema";
import type { PenggunaListItem } from "../types";
import { DeactivatePenggunaDialog } from "./deactivate-pengguna-dialog";
import { getPenggunaColumns } from "./pengguna-columns";
import { PenggunaFormDialog } from "./pengguna-form-dialog";

const roleValues = peranPenggunaOptions.map((option) => option.value);

const statusValues = ["active", "inactive"] as const;

type StatusFilter = (typeof statusValues)[number];

const allowedSortFields = ["name", "email", "peran", "createdAt"] as const;

type SortField = (typeof allowedSortFields)[number];

function isSortField(value: string): value is SortField {
  return allowedSortFields.includes(value as SortField);
}

function isRoleValue(value: string): value is PeranPenggunaValue {
  return roleValues.includes(value as PeranPenggunaValue);
}

function isStatusFilter(value: string): value is StatusFilter {
  return statusValues.includes(value as StatusFilter);
}

export function PenggunaTable() {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [filters, setFilters] = useQueryStates(
    {
      role: parseAsStringEnum<PeranPenggunaValue>(roleValues),

      status: parseAsStringEnum<StatusFilter>([...statusValues]),

      unitId: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const [selectedPengguna, setSelectedPengguna] = useState<PenggunaListItem | null>(null);

  const unitOptionsQuery = useActiveUnitGerejaOptionsQuery();

  const activeSort = sorting[0];

  const sortBy = activeSort && isSortField(activeSort.id) ? activeSort.id : "name";

  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const penggunaQuery = usePenggunaQuery({
    q: debouncedSearch,

    page: pagination.pageIndex + 1,

    pageSize: pagination.pageSize,

    peran: filters.role ?? undefined,

    aktif: filters.status === "active" ? true : filters.status === "inactive" ? false : undefined,

    unitGerejaId: filters.unitId || undefined,

    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      getPenggunaColumns({
        onEdit: (pengguna) => {
          setSelectedPengguna(pengguna);

          setFormOpen(true);
        },

        onDeactivate: (pengguna) => {
          setSelectedPengguna(pengguna);

          setDeactivateOpen(true);
        },
      }),
    [],
  );

  const paginationMeta = penggunaQuery.data?.meta?.pagination;

  const data = penggunaQuery.data?.data ?? [];

  const hasActiveFilters =
    Boolean(search) || Boolean(filters.role) || Boolean(filters.status) || Boolean(filters.unitId);

  function resetPage() {
    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    });
  }

  function handleRoleChange(value: string) {
    void setFilters({
      role: value === "all" || !isRoleValue(value) ? null : value,
    });

    resetPage();
  }

  function handleStatusChange(value: string) {
    void setFilters({
      status: value === "all" || !isStatusFilter(value) ? null : value,
    });

    resetPage();
  }

  function handleUnitChange(value: string) {
    void setFilters({
      unitId: value === "all" ? null : value,
    });

    resetPage();
  }

  function handleResetFilters() {
    resetSearch();
    void setFilters(null);
    resetPage();
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;

    setSorting(nextSorting);
    resetPage();
  };

  /*
   * Setelah pengguna dinonaktifkan atau data berubah,
   * halaman aktif mungkin lebih besar daripada
   * jumlah halaman terbaru.
   */
  useEffect(() => {
    if (penggunaQuery.isFetching || !paginationMeta || paginationMeta.totalPages === 0) {
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
    penggunaQuery.isFetching,
  ]);

  return (
    <>
      {penggunaQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Data pengguna tidak dapat dimuat</AlertTitle>

          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{penggunaQuery.error.message}</span>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void penggunaQuery.refetch();
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
        isLoading={penggunaQuery.isPending}
        emptyMessage="Belum ada data pengguna."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:flex-wrap">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama atau email..."
              />

              <Select value={filters.role ?? "all"} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full md:w-52.5">
                  <SelectValue placeholder="Semua role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua role</SelectItem>

                  {peranPenggunaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status ?? "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full md:w-42.5">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>

                  <SelectItem value="active">Aktif</SelectItem>

                  <SelectItem value="inactive">Tidak aktif</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.unitId || "all"}
                onValueChange={handleUnitChange}
                disabled={unitOptionsQuery.isPending}
              >
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue placeholder="Semua Unit Gereja" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua Unit Gereja</SelectItem>

                  {unitOptionsQuery.data?.data.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.kode} — {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="justify-start md:self-center"
                >
                  <RotateCcw />
                  Reset filter
                </Button>
              ) : null}
            </div>

            <Button
              type="button"
              onClick={() => {
                setSelectedPengguna(null);

                setFormOpen(true);
              }}
            >
              <Plus />
              Tambah Pengguna
            </Button>
          </div>
        )}
      />

      <PenggunaFormDialog
        open={formOpen}
        pengguna={selectedPengguna}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedPengguna(null);
          }
        }}
      />

      <DeactivatePenggunaDialog
        open={deactivateOpen}
        pengguna={selectedPengguna}
        onOpenChange={(open) => {
          setDeactivateOpen(open);

          if (!open) {
            setSelectedPengguna(null);
          }
        }}
      />
    </>
  );
}
