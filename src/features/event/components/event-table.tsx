"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";

import { DataTable, DataTableSearch, useDataTableQueryParams } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKategoriEventOptionsQuery } from "@/features/kategori-event/hooks/use-kategori-event-query";
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";

import { jenisEventOptions, statusEventOptions } from "../constants";
import { useEventQuery } from "../hooks/use-event-query";
import type { JenisEventValue, StatusEventValue } from "../schemas/event.schema";
import type { EventListItem } from "../types";
import { DeleteEventDialog } from "./delete-event-dialog";
import { getEventColumns } from "./event-columns";
import { EventFormDialog } from "./event-form-dialog";

const sortFields = ["nama", "tanggalMulai", "status", "jenis", "createdAt", "updatedAt"] as const;

type SortField = (typeof sortFields)[number];

type EventTableProps = {
  canManage: boolean;
};
export function EventTable({ canManage }: EventTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [filters, setFilters] = useQueryStates(
    {
      unitId: parseAsString.withDefault(""),

      categoryId: parseAsString.withDefault(""),

      status: parseAsStringEnum<StatusEventValue>(statusEventOptions.map((item) => item.value)),

      jenis: parseAsStringEnum<JenisEventValue>(jenisEventOptions.map((item) => item.value)),
    },

    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "tanggalMulai",
      desc: true,
    },
  ]);

  const [selected, setSelected] = useState<EventListItem | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const units = useActiveUnitGerejaOptionsQuery();

  const categories = useKategoriEventOptionsQuery();

  const sort = sorting[0];

  const sortBy = sortFields.includes(sort?.id as SortField)
    ? (sort.id as SortField)
    : "tanggalMulai";

  const query = useEventQuery({
    q: debouncedSearch,

    page: pagination.pageIndex + 1,

    pageSize: pagination.pageSize,

    unitGerejaId: filters.unitId || undefined,

    kategoriEventId: filters.categoryId || undefined,

    status: filters.status ?? undefined,

    jenis: filters.jenis ?? undefined,

    sortBy,

    sortOrder: sort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getEventColumns({
        canManage,
        onEdit: (event) => {
          setSelected(event);
          setFormOpen(true);
        },

        onDelete: (event) => {
          setSelected(event);
          setDeleteOpen(true);
        },
      }),
    [canManage],
  );

  const meta = query.data?.meta?.pagination;

  function resetPage() {
    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    });
  }

  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    setSorting((current) => (typeof updater === "function" ? updater(current) : updater));

    resetPage();
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(filters.unitId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.status) ||
    Boolean(filters.jenis);

  return (
    <>
      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        getRowId={(row) => row.id}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={meta?.totalPages ?? 0}
        totalItems={meta?.total ?? 0}
        sorting={sorting}
        onSortingChange={changeSorting}
        isLoading={query.isPending}
        emptyMessage="Belum ada data Event."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari Event atau lokasi..."
              />

              <Select
                value={filters.unitId || "all"}
                onValueChange={(value) => {
                  void setFilters({
                    unitId: value === "all" ? null : value,
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-52.5">
                  <SelectValue placeholder="Semua unit" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua unit</SelectItem>

                  {units.data?.data.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.kode} — {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.categoryId || "all"}
                onValueChange={(value) => {
                  void setFilters({
                    categoryId: value === "all" ? null : value,
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-52.5">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>

                  {categories.data?.data.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status ?? "all"}
                onValueChange={(value) => {
                  void setFilters({
                    status: value === "all" ? null : (value as StatusEventValue),
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>

                  {statusEventOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.jenis ?? "all"}
                onValueChange={(value) => {
                  void setFilters({
                    jenis: value === "all" ? null : (value as JenisEventValue),
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Semua jenis" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua jenis</SelectItem>

                  {jenisEventOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetSearch();
                    void setFilters(null);
                    resetPage();
                  }}
                >
                  <RotateCcw />
                  Reset
                </Button>
              ) : null}
            </div>

            {canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Tambah Event
              </Button>
            ) : null}
          </div>
        )}
      />

      <EventFormDialog
        open={formOpen}
        event={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <DeleteEventDialog
        open={deleteOpen}
        event={selected}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />
    </>
  );
}
