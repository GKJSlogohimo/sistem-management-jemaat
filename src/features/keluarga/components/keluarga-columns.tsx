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

import type { KeluargaListItem } from "../types";

type KeluargaColumnsOptions = {
  onEdit: (keluarga: KeluargaListItem) => void;
  onDelete: (keluarga: KeluargaListItem) => void;
};

export function getKeluargaColumns({
  onEdit,
  onDelete,
}: KeluargaColumnsOptions): ColumnDef<KeluargaListItem>[] {
  return [
    {
      accessorKey: "nomorKK",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor KK" />,

      cell: ({ row }) => <span className="font-mono text-sm">{row.original.nomorKK}</span>,
    },

    {
      accessorKey: "namaKepalaKeluarga",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Kepala keluarga" />,

      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.namaKepalaKeluarga}</p>

          {row.original.alamat ? (
            <p className="max-w-[320px] truncate text-xs text-muted-foreground">
              {row.original.alamat}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      id: "unitGereja",

      accessorFn: (row) => row.unitGereja.nama,

      header: ({ column }) => <DataTableColumnHeader column={column} title="Unit gereja" />,

      cell: ({ row }) => (
        <div>
          <p>{row.original.unitGereja.nama}</p>

          <p className="text-xs text-muted-foreground">{row.original.unitGereja.kode}</p>
        </div>
      ),
    },

    {
      accessorKey: "noHp",
      enableSorting: false,
      header: "Nomor HP",

      cell: ({ row }) => row.original.noHp ?? "-",
    },

    {
      accessorKey: "jumlahAnggota",
      enableSorting: false,
      header: "Anggota",

      cell: ({ row }) => <Badge variant="secondary">{row.original.jumlahAnggota}</Badge>,
    },

    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,

      cell: ({ row }) => {
        const keluarga = row.original;

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

                <DropdownMenuItem onClick={() => onEdit(keluarga)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => onDelete(keluarga)}>
                  <Trash2 />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
