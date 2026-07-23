"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { DataTable, DataTableSearch, useDataTableQueryParams } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";
import type { JenisBaptisan } from "@/generated/prisma/client";

import { jenisBaptisanOptions } from "../constants";
import { useBaptisanQuery } from "../hooks/use-baptisan-query";
import type { BaptisanListItem, BaptisanSortBy } from "../types";
import { getBaptisanColumns } from "./baptisan-columns";
import { BaptisanDetailDialog } from "./baptisan-detail-dialog";
import { BaptisanFormDialog } from "./baptisan-form-dialog";
import { BaptisanDeleteDialog } from "./delete-baptisan-dialog";

type BaptisanTableProps = {
  canManage: boolean;
};

export function BaptisanTable({ canManage }: BaptisanTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [unitId, setUnitId] = useQueryState("unitId", parseAsString.withDefault(""));

  const [jenis, setJenis] = useQueryState("jenis", parseAsString.withDefault(""));

  const [tanggalDari, setTanggalDari] = useQueryState("tanggalDari", parseAsString.withDefault(""));

  const [tanggalSampai, setTanggalSampai] = useQueryState(
    "tanggalSampai",
    parseAsString.withDefault(""),
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "tanggalBaptisan",
      desc: true,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<BaptisanListItem | null>(null);

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const sort = sorting[0];

  const query = useBaptisanQuery({
    q: debouncedSearch,

    page: pagination.pageIndex + 1,

    pageSize: pagination.pageSize,

    unitGerejaId: unitId || undefined,

    jenis: jenis ? (jenis as JenisBaptisan) : undefined,

    tanggalDari: tanggalDari || undefined,

    tanggalSampai: tanggalSampai || undefined,

    sortBy: (sort?.id as BaptisanSortBy) ?? "tanggalBaptisan",

    sortOrder: sort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getBaptisanColumns({
        canManage,

        onDetail: (baptisan) => {
          setSelected(baptisan);

          setDetailOpen(true);
        },

        onEdit: (baptisan) => {
          setSelected(baptisan);

          setFormOpen(true);
        },

        onDelete: (baptisan) => {
          setSelected(baptisan);

          setDeleteOpen(true);
        },
      }),
    [canManage],
  );

  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    setSorting((current) => (typeof updater === "function" ? updater(current) : updater));

    resetPage();
  };

  const meta = query.data?.meta?.pagination;

  function resetPage() {
    onPaginationChange({
      pageIndex: 0,

      pageSize: pagination.pageSize,
    });
  }

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
        emptyMessage="Belum ada data Baptisan."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama, nomor induk, sertifikat, atau pelayan..."
              />

              <Select
                value={unitId || "all"}
                onValueChange={(value) => {
                  void setUnitId(value === "all" ? null : value);

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full lg:w-55">
                  <SelectValue placeholder="Semua unit" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua unit</SelectItem>

                  {unitOptions.data?.data.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.kode}
                      {" — "}
                      {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={jenis || "all"}
                onValueChange={(value) => {
                  void setJenis(value === "all" ? null : value);

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full lg:w-45">
                  <SelectValue placeholder="Semua jenis" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua jenis</SelectItem>

                  {jenisBaptisanOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:flex">
                <div className="space-y-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <label
                    htmlFor="tanggalDari"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Dari tanggal
                  </label>

                  <Input
                    id="tanggalDari"
                    type="date"
                    value={tanggalDari}
                    className="w-full lg:w-40"
                    onChange={(event) => {
                      void setTanggalDari(event.target.value || null);
                      resetPage();
                    }}
                  />
                </div>

                <div className="space-y-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <label
                    htmlFor="tanggalSampai"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Sampai tanggal
                  </label>

                  <Input
                    id="tanggalSampai"
                    type="date"
                    value={tanggalSampai}
                    min={tanggalDari || undefined}
                    className="w-full lg:w-40"
                    onChange={(event) => {
                      void setTanggalSampai(event.target.value || null);
                      resetPage();
                    }}
                  />
                </div>
              </div>
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
                Tambah Baptisan
              </Button>
            ) : null}
          </div>
        )}
      />

      <BaptisanFormDialog
        open={formOpen}
        baptisan={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <BaptisanDetailDialog
        open={detailOpen}
        baptisan={selected}
        onOpenChange={(open) => {
          setDetailOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <BaptisanDeleteDialog
        open={deleteOpen}
        baptisan={selected}
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
