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

import { jenisBaptisanLabels } from "../constants";
import type { BaptisanListItem } from "../types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

type GetBaptisanColumnsOptions = {
  canManage: boolean;

  onDetail: (baptisan: BaptisanListItem) => void;

  onEdit: (baptisan: BaptisanListItem) => void;

  onDelete: (baptisan: BaptisanListItem) => void;
};

export function getBaptisanColumns({
  canManage,
  onDetail,
  onEdit,
  onDelete,
}: GetBaptisanColumnsOptions): ColumnDef<BaptisanListItem>[] {
  return [
    {
      id: "namaJemaat",

      accessorFn: (row) => row.jemaat.namaLengkap,

      header: ({ column }) => <DataTableColumnHeader column={column} title="Jemaat" />,

      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.jemaat.namaLengkap}</div>

          <div className="text-xs text-muted-foreground">
            {row.original.jemaat.nomorIndukGereja}
          </div>
        </div>
      ),
    },

    {
      accessorKey: "jenis",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,

      cell: ({ row }) => (
        <Badge variant="secondary">{jenisBaptisanLabels[row.original.jenis]}</Badge>
      ),
    },

    {
      accessorKey: "tanggalBaptisan",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,

      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDate(row.original.tanggalBaptisan)}</span>
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
      accessorKey: "nomorSertifikat",

      header: ({ column }) => <DataTableColumnHeader column={column} title="No. Sertifikat" />,

      cell: ({ row }) => row.original.nomorSertifikat ?? "-",
    },

    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,

      cell: ({ row }) => {
        const baptisan = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Tindakan Baptisan">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    onDetail(baptisan);
                  }}
                >
                  <Eye />
                  Detail
                </DropdownMenuItem>

                {canManage ? (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => {
                        onEdit(baptisan);
                      }}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        onDelete(baptisan);
                      }}
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
