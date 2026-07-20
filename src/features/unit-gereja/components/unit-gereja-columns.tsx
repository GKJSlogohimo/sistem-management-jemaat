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

import { jenisUnitGerejaLabels } from "../constants";
import type { UnitGerejaListItem } from "../types";

type UnitGerejaColumnsOptions = {
  onEdit: (unit: UnitGerejaListItem) => void;
  onDelete: (unit: UnitGerejaListItem) => void;
};

export function getUnitGerejaColumns({
  onEdit,
  onDelete,
}: UnitGerejaColumnsOptions): ColumnDef<UnitGerejaListItem>[] {
  return [
    {
      accessorKey: "kode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kode" />,
      cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.kode}</span>,
    },
    {
      accessorKey: "nama",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama unit" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.nama}</p>

          {row.original.parent ? (
            <p className="text-xs text-muted-foreground">Induk: {row.original.parent.nama}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "jenis",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,
      cell: ({ row }) => (
        <Badge variant="outline">{jenisUnitGerejaLabels[row.original.jenis]}</Badge>
      ),
    },
    {
      accessorKey: "penanggungJawab",
      enableSorting: false,
      header: "Penanggung jawab",
      cell: ({ row }) => row.original.penanggungJawab ?? "-",
    },
    {
      accessorKey: "noHp",
      enableSorting: false,
      header: "Nomor HP",
      cell: ({ row }) => row.original.noHp ?? "-",
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
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const unit = row.original;

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

                <DropdownMenuItem onClick={() => onEdit(unit)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => onDelete(unit)}>
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
