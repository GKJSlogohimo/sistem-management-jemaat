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
import type { StatusPencatatanKematian } from "@/generated/prisma/client";

import { statusKematianLabels, statusKematianOptions } from "../constants";
import { useKematianQuery } from "../hooks/use-kematian-query";
import type { KematianListItem, KematianSortBy } from "../types";
import { DeleteKematianDialog } from "./delete-kematian-dialog";
import { getKematianColumns } from "./kematian-columns";
import { KematianDetailDialog } from "./kematian-detail-dialog";
import { KematianFormDialog } from "./kematian-form-dialog";

function isKematianStatus(value: string): value is StatusPencatatanKematian {
  return ["DRAFT", "TERVERIFIKASI", "DIBATALKAN"].includes(value);
}

type KematianTableProps = {
  canManage: boolean;
};

export function KematianTable({ canManage }: KematianTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [unitId, setUnitId] = useQueryState("unitId", parseAsString.withDefault(""));

  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));

  const [tanggalDari, setTanggalDari] = useQueryState("tanggalDari", parseAsString.withDefault(""));

  const [tanggalSampai, setTanggalSampai] = useQueryState(
    "tanggalSampai",
    parseAsString.withDefault(""),
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "tanggalMeninggal",
      desc: true,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<KematianListItem | null>(null);

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const sort = sorting[0];

  const query = useKematianQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,

    unitGerejaId: unitId || undefined,

    status: isKematianStatus(status) ? status : undefined,

    tanggalDari: tanggalDari || undefined,

    tanggalSampai: tanggalSampai || undefined,

    sortBy: (sort?.id as KematianSortBy) ?? "tanggalMeninggal",

    sortOrder: sort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getKematianColumns({
        canManage,

        onDetail: (kematian) => {
          setSelected(kematian);
          setDetailOpen(true);
        },

        onEdit: (kematian) => {
          setSelected(kematian);
          setFormOpen(true);
        },

        onDelete: (kematian) => {
          setSelected(kematian);
          setDeleteOpen(true);
        },
      }),
    [canManage],
  );

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

  function resetFilters() {
    void setUnitId(null);
    void setStatus(null);
    void setTanggalDari(null);
    void setTanggalSampai(null);

    resetSearch();
    resetPage();
  }

  const meta = query.data?.meta?.pagination;

  const hasFilter =
    Boolean(search) ||
    Boolean(unitId) ||
    Boolean(status) ||
    Boolean(tanggalDari) ||
    Boolean(tanggalSampai);

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
        emptyMessage="Belum ada pencatatan kematian."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama Jemaat atau nomor surat..."
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
                      {unit.kode} — {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status || "all"}
                onValueChange={(value) => {
                  void setStatus(value === "all" ? null : value);

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>

                  {statusKematianOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {statusKematianLabels[option.value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-1">
                <label
                  htmlFor="kematian-tanggal-dari"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Dari tanggal
                </label>

                <Input
                  id="kematian-tanggal-dari"
                  type="date"
                  value={tanggalDari}
                  className="w-full lg:w-42"
                  onChange={(event) => {
                    void setTanggalDari(event.target.value || null);

                    resetPage();
                  }}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="kematian-tanggal-sampai"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Sampai tanggal
                </label>

                <Input
                  id="kematian-tanggal-sampai"
                  type="date"
                  value={tanggalSampai}
                  min={tanggalDari || undefined}
                  className="w-full lg:w-42"
                  onChange={(event) => {
                    void setTanggalSampai(event.target.value || null);

                    resetPage();
                  }}
                />
              </div>

              {hasFilter ? (
                <Button type="button" variant="ghost" onClick={resetFilters}>
                  Reset filter
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
                Tambah Kematian
              </Button>
            ) : null}
          </div>
        )}
      />

      <KematianDetailDialog
        open={detailOpen}
        kematian={selected}
        onOpenChange={(open) => {
          setDetailOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <KematianFormDialog
        open={formOpen}
        kematian={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <DeleteKematianDialog
        open={deleteOpen}
        kematian={selected}
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
