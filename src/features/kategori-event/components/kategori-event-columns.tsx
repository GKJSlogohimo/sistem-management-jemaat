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

import { getKategoriEventIcon } from "../constants";
import type { KategoriEventListItem } from "../types";

type KategoriEventColumnsOptions = {
  canManage: boolean;
  onEdit: (kategori: KategoriEventListItem) => void;
  onDelete: (kategori: KategoriEventListItem) => void;
};

export function getKategoriEventColumns({
  canManage,
  onEdit,
  onDelete,
}: KategoriEventColumnsOptions): ColumnDef<KategoriEventListItem>[] {
  const columns: ColumnDef<KategoriEventListItem>[] = [
    {
      accessorKey: "nama",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,

      cell: ({ row }) => {
        const kategori = row.original;

        const Icon = getKategoriEventIcon(kategori.ikon);

        return (
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-white"
              style={{
                backgroundColor: kategori.warna ?? "#64748B",
              }}
            >
              <Icon className="size-4" />
            </div>

            <div>
              <p className="font-medium">{kategori.nama}</p>

              {kategori.ikon ? (
                <p className="text-xs text-muted-foreground">{kategori.ikon}</p>
              ) : null}
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "deskripsi",
      enableSorting: false,
      header: "Deskripsi",

      cell: ({ row }) =>
        row.original.deskripsi ? (
          <p className="max-w-95 truncate text-sm text-muted-foreground">
            {row.original.deskripsi}
          </p>
        ) : (
          "-"
        ),
    },

    {
      accessorKey: "jumlahEvent",
      enableSorting: false,
      header: "Event",

      cell: ({ row }) => <Badge variant="secondary">{row.original.jumlahEvent}</Badge>,
    },

    {
      accessorKey: "aktif",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,

      cell: ({ row }) => (
        <Badge variant={row.original.aktif ? "default" : "secondary"}>
          {row.original.aktif ? "Aktif" : "Tidak aktif"}
        </Badge>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      enableSorting: false,
      enableHiding: false,

      cell: ({ row }) => {
        const kategori = row.original;

        return (
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

                <DropdownMenuItem onClick={() => onEdit(kategori)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => onDelete(kategori)}>
                  <Trash2 />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }
  return columns;
}
