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

import type { WilayahListItem } from "../types";

type WilayahColumnsOptions = {
  onEdit: (wilayah: WilayahListItem) => void;
  onDelete: (wilayah: WilayahListItem) => void;
};

export function getWilayahColumns({
  onEdit,
  onDelete,
}: WilayahColumnsOptions): ColumnDef<WilayahListItem>[] {
  return [
    {
      accessorKey: "nama",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama wilayah" />,

      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.nama}</p>

          {row.original.keterangan ? (
            <p className="max-w-90 truncate text-xs text-muted-foreground">
              {row.original.keterangan}
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
      accessorKey: "jumlahJemaat",
      enableSorting: false,
      header: "Jumlah jemaat",

      cell: ({ row }) => <Badge variant="secondary">{row.original.jumlahJemaat}</Badge>,
    },

    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,

      cell: ({ row }) => {
        const wilayah = row.original;

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

                <DropdownMenuItem onClick={() => onEdit(wilayah)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => onDelete(wilayah)}>
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
