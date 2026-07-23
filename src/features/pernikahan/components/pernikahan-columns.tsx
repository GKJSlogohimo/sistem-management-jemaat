"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { PernikahanListItem } from "../types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

type GetPernikahanColumnsOptions = {
  canManage: boolean;
  onDetail: (pernikahan: PernikahanListItem) => void;
  onEdit: (pernikahan: PernikahanListItem) => void;
  onDelete: (pernikahan: PernikahanListItem) => void;
};

export function getPernikahanColumns({
  canManage,
  onDetail,
  onEdit,
  onDelete,
}: GetPernikahanColumnsOptions): ColumnDef<PernikahanListItem>[] {
  return [
    {
      accessorKey: "namaPihakSatu",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pihak Pertama" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.namaPihakSatu}</div>

          <Badge variant="outline">
            {row.original.jemaatPihakSatuId ? "Jemaat" : "Pihak luar"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "namaPihakDua",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pihak Kedua" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.namaPihakDua}</div>

          <Badge variant="outline">{row.original.jemaatPihakDuaId ? "Jemaat" : "Pihak luar"}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "tanggalPernikahan",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDate(row.original.tanggalPernikahan)}</span>
      ),
    },
    {
      id: "unitGereja",
      accessorFn: (row) => row.unitGereja.nama,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Unit Gereja" />,
      cell: ({ row }) => (
        <div>
          <div>{row.original.unitGereja.nama}</div>
          <div className="text-xs text-muted-foreground">{row.original.unitGereja.kode}</div>
        </div>
      ),
    },
    {
      accessorKey: "nomorPencatatan",
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. Pencatatan" />,
      cell: ({ row }) => row.original.nomorPencatatan ?? "-",
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const pernikahan = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Tindakan Pernikahan">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDetail(pernikahan)}>
                  <Eye />
                  Detail
                </DropdownMenuItem>

                {canManage ? (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => onEdit(pernikahan)}>
                      <Pencil />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(pernikahan)}
                    >
                      <Trash2 />
                      Hapus
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
