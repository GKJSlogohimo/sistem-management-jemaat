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

import type { KeluargaListItem } from "../types";

type KeluargaColumnsOptions = {
  canManage: boolean;
  canViewNomorKK: boolean;
  onDetail: (keluarga: KeluargaListItem) => void;
  onEdit: (keluarga: KeluargaListItem) => void;
  onDelete: (keluarga: KeluargaListItem) => void;
};

export function getKeluargaColumns({
  canManage,
  canViewNomorKK,
  onDetail,
  onEdit,
  onDelete,
}: KeluargaColumnsOptions): ColumnDef<KeluargaListItem>[] {
  return [
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
    ...(canViewNomorKK
      ? [
          {
            accessorKey: "nomorKK",

            header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor KK" />,

            cell: ({ row }) => row.original.nomorKK ?? "-",
          } satisfies ColumnDef<KeluargaListItem>,
        ]
      : []),
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
                <Button type="button" variant="ghost" size="icon" aria-label="Tindakan Keluarga">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    onDetail(keluarga);
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
                        onEdit(keluarga);
                      }}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        onDelete(keluarga);
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
