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

import { usePernikahanQuery } from "../hooks/use-pernikahan-query";
import type { PernikahanListItem, PernikahanSortBy } from "../types";
import { DeletePernikahanDialog } from "./delete-pernikahan-dialog";
import { getPernikahanColumns } from "./pernikahan-columns";
import { PernikahanDetailDialog } from "./pernikahan-detail-dialog";
import { PernikahanFormDialog } from "./pernikahan-form-dialog";

type PernikahanTableProps = {
  canManage: boolean;
};

export function PernikahanTable({ canManage }: PernikahanTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [unitId, setUnitId] = useQueryState("unitId", parseAsString.withDefault(""));

  const [tanggalDari, setTanggalDari] = useQueryState("tanggalDari", parseAsString.withDefault(""));

  const [tanggalSampai, setTanggalSampai] = useQueryState(
    "tanggalSampai",
    parseAsString.withDefault(""),
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "tanggalPernikahan",
      desc: true,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<PernikahanListItem | null>(null);

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const sort = sorting[0];

  const query = usePernikahanQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    unitGerejaId: unitId || undefined,
    tanggalDari: tanggalDari || undefined,
    tanggalSampai: tanggalSampai || undefined,
    sortBy: (sort?.id as PernikahanSortBy) ?? "tanggalPernikahan",
    sortOrder: sort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getPernikahanColumns({
        canManage,
        onDetail: (pernikahan) => {
          setSelected(pernikahan);
          setDetailOpen(true);
        },
        onEdit: (pernikahan) => {
          setSelected(pernikahan);
          setFormOpen(true);
        },
        onDelete: (pernikahan) => {
          setSelected(pernikahan);
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

  const meta = query.data?.meta?.pagination;

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
        emptyMessage="Belum ada data Pernikahan."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama pihak, nomor pencatatan, atau sertifikat..."
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

              <div className="space-y-1">
                <label
                  htmlFor="pernikahan-tanggal-dari"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Dari tanggal
                </label>

                <Input
                  id="pernikahan-tanggal-dari"
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
                  htmlFor="pernikahan-tanggal-sampai"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Sampai tanggal
                </label>

                <Input
                  id="pernikahan-tanggal-sampai"
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
                Tambah Pernikahan
              </Button>
            ) : null}
          </div>
        )}
      />

      <PernikahanFormDialog
        open={formOpen}
        pernikahan={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <PernikahanDetailDialog
        open={detailOpen}
        pernikahan={selected}
        onOpenChange={(open) => {
          setDetailOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <DeletePernikahanDialog
        open={deleteOpen}
        pernikahan={selected}
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
