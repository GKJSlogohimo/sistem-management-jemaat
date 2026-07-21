"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatParticipantTime, jenisPesertaLabels, statusPesertaEventLabels } from "../constants";
import type { PesertaEventListItem } from "../types";

type Options = {
  onEdit: (peserta: PesertaEventListItem) => void;
  onDelete: (peserta: PesertaEventListItem) => void;
};

export function getPesertaEventColumns({
  onEdit,
  onDelete,
}: Options): ColumnDef<PesertaEventListItem>[] {
  return [
    {
      accessorKey: "nomorAntrian",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Antrean" />,

      cell: ({ row }) => (
        <span className="font-mono text-base font-semibold">
          {row.original.nomorAntrian ?? "-"}
        </span>
      ),
    },

    {
      accessorKey: "namaPesertaSnapshot",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Peserta" />,

      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.namaPesertaSnapshot}</p>

          <p className="text-xs text-muted-foreground">
            {row.original.sumber.nik ? `NIK ${row.original.sumber.nik}` : "Tanpa NIK"}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "jenisPeserta",

      header: "Jenis",

      cell: ({ row }) => (
        <Badge variant="outline">{jenisPesertaLabels[row.original.jenisPeserta]}</Badge>
      ),
    },

    {
      id: "kontak",
      header: "Kontak",
      enableSorting: false,

      cell: ({ row }) => (
        <div>
          <p>{row.original.sumber.noHp ?? "-"}</p>

          {row.original.sumber.email ? (
            <p className="text-xs text-muted-foreground">{row.original.sumber.email}</p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "status",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,

      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "SELESAI"
              ? "default"
              : row.original.status === "BATAL"
                ? "destructive"
                : "secondary"
          }
        >
          {statusPesertaEventLabels[row.original.status]}
        </Badge>
      ),
    },

    {
      accessorKey: "waktuTercatat",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu tercatat" />,

      cell: ({ row }) => formatParticipantTime(row.original.waktuTercatat),
    },

    {
      id: "actions",
      enableSorting: false,

      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tindakan</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                <Trash2 />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
