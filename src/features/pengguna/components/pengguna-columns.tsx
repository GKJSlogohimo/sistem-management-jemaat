"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, UserX } from "lucide-react";

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

import { peranPenggunaLabels } from "../constants";
import type { PenggunaListItem } from "../types";

type Options = {
  onEdit: (user: PenggunaListItem) => void;
  onDeactivate: (user: PenggunaListItem) => void;
};

export function getPenggunaColumns({
  onEdit,
  onDeactivate,
}: Options): ColumnDef<PenggunaListItem>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pengguna" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "peran",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) =>
        row.original.peran ? (
          <Badge variant="outline">{peranPenggunaLabels[row.original.peran]}</Badge>
        ) : (
          <Badge variant="destructive">Belum dikonfigurasi</Badge>
        ),
    },
    {
      id: "unitGereja",
      enableSorting: false,
      header: "Unit Gereja",
      cell: ({ row }) =>
        row.original.unitGereja ? (
          <div>
            <p>{row.original.unitGereja.nama}</p>
            <p className="text-xs text-muted-foreground">{row.original.unitGereja.kode}</p>
          </div>
        ) : (
          "-"
        ),
    },
    {
      id: "jemaat",
      enableSorting: false,
      header: "Jemaat",
      cell: ({ row }) =>
        row.original.jemaat ? (
          <div>
            <p>{row.original.jemaat.namaLengkap}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.jemaat.nomorIndukGereja}
            </p>
          </div>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "aktif",
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.aktif ? "default" : "secondary"}>
          {row.original.aktif ? "Aktif" : "Tidak aktif"}
        </Badge>
      ),
    },
    {
      accessorKey: "jumlahSesiAktif",
      enableSorting: false,
      header: "Sesi",
      cell: ({ row }) => row.original.jumlahSesiAktif,
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

              {row.original.aktif ? (
                <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(row.original)}>
                  <UserX />
                  Nonaktifkan
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
