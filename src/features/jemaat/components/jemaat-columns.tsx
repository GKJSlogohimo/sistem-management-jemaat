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

import { jenisKelaminLabels, statusJemaatLabels } from "../constants";
import type { JemaatListItem } from "../types";

type Options = {
  canManage: boolean;
  canViewNik: boolean;
  onEdit: (jemaat: JemaatListItem) => void;
  onDelete: (jemaat: JemaatListItem) => void;
};

export function getJemaatColumns({
  canManage,
  canViewNik,
  onEdit,
  onDelete,
}: Options): ColumnDef<JemaatListItem>[] {
  const columns: ColumnDef<JemaatListItem>[] = [
    {
      accessorKey: "nomorIndukGereja",
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. induk" />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.nomorIndukGereja}</span>,
    },
    {
      accessorKey: "namaLengkap",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama jemaat" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.namaLengkap}</p>
          {canViewNik ? (
            <p className="text-xs text-muted-foreground">NIK {row.original.nik}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "jenisKelamin",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis kelamin" />,
      cell: ({ row }) => jenisKelaminLabels[row.original.jenisKelamin],
    },
    {
      id: "unit",
      enableSorting: false,
      header: "Unit dan wilayah",
      cell: ({ row }) => (
        <div>
          <p>{row.original.unitGereja.nama}</p>
          <p className="text-xs text-muted-foreground">{row.original.wilayah.nama}</p>
        </div>
      ),
    },
    {
      id: "keluarga",
      enableSorting: false,
      header: "Keluarga",
      cell: ({ row }) => (
        <div>
          <p>{row.original.keluarga.namaKepalaKeluarga}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.keluarga.nomorKK}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "AKTIF" ? "default" : "secondary"}>
          {statusJemaatLabels[row.original.status]}
        </Badge>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <MoreHorizontal />
                <span className="sr-only">Buka menu</span>
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
    });
  }
  return columns;
}
