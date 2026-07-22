"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
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
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";

import { jenisKelaminOptions, statusJemaatOptions } from "../constants";
import { useJemaatQuery } from "../hooks/use-jemaat-query";
import type { JenisKelaminValue, StatusJemaatValue } from "../schemas/jemaat.schema";
import type { JemaatListItem } from "../types";
import { DeleteJemaatDialog } from "./delete-jemaat-dialog";
import { getJemaatColumns } from "./jemaat-columns";
import { JemaatFormDialog } from "./jemaat-form-dialog";

type JemaatTableProps = {
  canManage: boolean;
  canViewNik: boolean;
};

export function JemaatTable({ canManage, canViewNik }: JemaatTableProps) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [unitId, setUnitId] = useQueryState("unitId", parseAsString.withDefault(""));

  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));

  const [gender, setGender] = useQueryState("gender", parseAsString.withDefault(""));

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "namaLengkap",
      desc: false,
    },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<JemaatListItem | null>(null);

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const sort = sorting[0];

  const query = useJemaatQuery({
    q: debouncedSearch,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    unitGerejaId: unitId || undefined,
    status: status ? (status as StatusJemaatValue) : undefined,
    jenisKelamin: gender ? (gender as JenisKelaminValue) : undefined,
    sortBy:
      (sort?.id as
        | "nomorIndukGereja"
        | "namaLengkap"
        | "jenisKelamin"
        | "status"
        | "createdAt"
        | "updatedAt") ?? "namaLengkap",
    sortOrder: sort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getJemaatColumns({
        canManage,
        canViewNik,
        onEdit: (jemaat) => {
          setSelected(jemaat);
          setFormOpen(true);
        },
        onDelete: (jemaat) => {
          setSelected(jemaat);
          setDeleteOpen(true);
        },
      }),
    [canManage, canViewNik],
  );

  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    setSorting((current) => (typeof updater === "function" ? updater(current) : updater));

    onPaginationChange({
      pageIndex: 0,
      pageSize: pagination.pageSize,
    });
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
        emptyMessage="Belum ada data jemaat."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama, NIK, atau nomor induk..."
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
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  {statusJemaatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={gender || "all"}
                onValueChange={(value) => {
                  void setGender(value === "all" ? null : value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full lg:w-42.5">
                  <SelectValue placeholder="Semua gender" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua gender</SelectItem>
                  {jenisKelaminOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Tambah Jemaat
              </Button>
            ) : null}
          </div>
        )}
      />

      <JemaatFormDialog
        open={formOpen}
        jemaat={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <DeleteJemaatDialog
        open={deleteOpen}
        jemaat={selected}
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
