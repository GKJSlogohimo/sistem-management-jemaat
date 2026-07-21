"use client";

import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw } from "lucide-react";
import { parseAsStringEnum, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";

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
import type { EventDetail } from "@/features/event/types";

import { jenisPesertaOptions, statusPesertaEventOptions } from "../constants";
import { usePesertaEventQuery } from "../hooks/use-peserta-event-query";
import type { JenisPesertaValue, StatusPesertaEventValue } from "../schemas/peserta-event.schema";
import type { PesertaEventListItem } from "../types";
import { DeletePesertaEventDialog } from "./delete-peserta-event-dialog";
import { getPesertaEventColumns } from "./peserta-event-columns";
import { PesertaEventFormDialog } from "./peserta-event-form-dialog";

const sortFields = [
  "namaPesertaSnapshot",
  "nomorAntrian",
  "status",
  "waktuTercatat",
  "updatedAt",
] as const;

type SortField = (typeof sortFields)[number];

type Props = {
  event: EventDetail;
};

export function PesertaEventTable({ event }: Props) {
  const { search, debouncedSearch, pagination, setSearch, resetSearch, onPaginationChange } =
    useDataTableQueryParams();

  const [filters, setFilters] = useQueryStates(
    {
      participantType: parseAsStringEnum<JenisPesertaValue>(
        jenisPesertaOptions.map((item) => item.value),
      ),

      participantStatus: parseAsStringEnum<StatusPesertaEventValue>(
        statusPesertaEventOptions.map((item) => item.value),
      ),
    },

    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "waktuTercatat",
      desc: true,
    },
  ]);

  const [selected, setSelected] = useState<PesertaEventListItem | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const activeSort = sorting[0];

  const sortBy = sortFields.includes(activeSort?.id as SortField)
    ? (activeSort.id as SortField)
    : "waktuTercatat";

  const query = usePesertaEventQuery(event.id, {
    q: debouncedSearch,

    page: pagination.pageIndex + 1,

    pageSize: pagination.pageSize,

    jenisPeserta: filters.participantType ?? undefined,

    status: filters.participantStatus ?? undefined,

    sortBy,

    sortOrder: activeSort?.desc ? "desc" : "asc",
  });

  const columns = useMemo(
    () =>
      getPesertaEventColumns({
        onEdit: (peserta) => {
          setSelected(peserta);
          setFormOpen(true);
        },

        onDelete: (peserta) => {
          setSelected(peserta);
          setDeleteOpen(true);
        },
      }),
    [],
  );

  const meta = query.data?.meta?.pagination;

  const registrationAvailable = event.status === "DIBUKA" && event.gunakanPencatatanPeserta;

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
    Boolean(search) || Boolean(filters.participantType) || Boolean(filters.participantStatus);

  return (
    <>
      {!event.gunakanPencatatanPeserta ? (
        <Alert>
          <AlertTitle>Pencatatan peserta tidak aktif</AlertTitle>

          <AlertDescription>
            Aktifkan pencatatan peserta pada konfigurasi Event untuk menggunakan modul ini.
          </AlertDescription>
        </Alert>
      ) : null}

      {event.gunakanPencatatanPeserta && event.status !== "DIBUKA" ? (
        <Alert>
          <AlertTitle>Registrasi ditutup</AlertTitle>

          <AlertDescription>
            Peserta baru hanya dapat ditambahkan ketika Event berstatus Dibuka.
          </AlertDescription>
        </Alert>
      ) : null}

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
        emptyMessage="Belum ada peserta Event."
        toolbar={() => (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 md:flex-row">
              <DataTableSearch
                value={search}
                onValueChange={setSearch}
                onReset={resetSearch}
                placeholder="Cari nama, NIK, atau nomor induk..."
              />

              <Select
                value={filters.participantType ?? "all"}
                onValueChange={(value) => {
                  void setFilters({
                    participantType: value === "all" ? null : (value as JenisPesertaValue),
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-42.5">
                  <SelectValue placeholder="Semua jenis" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua jenis</SelectItem>

                  {jenisPesertaOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.participantStatus ?? "all"}
                onValueChange={(value) => {
                  void setFilters({
                    participantStatus: value === "all" ? null : (value as StatusPesertaEventValue),
                  });

                  resetPage();
                }}
              >
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>

                  {statusPesertaEventOptions.map((item) => (
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

            <Button
              type="button"
              disabled={!registrationAvailable}
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Tambah Peserta
            </Button>
          </div>
        )}
      />

      <PesertaEventFormDialog
        open={formOpen}
        eventId={event.id}
        izinkanNonJemaat={event.izinkanNonJemaat}
        peserta={selected}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelected(null);
          }
        }}
      />

      <DeletePesertaEventDialog
        open={deleteOpen}
        eventId={event.id}
        peserta={selected}
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
