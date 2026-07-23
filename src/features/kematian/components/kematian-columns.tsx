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

import { statusKematianLabels } from "../constants";
import type { KematianListItem } from "../types";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getStatusVariant(status: KematianListItem["status"]) {
  switch (status) {
    case "TERVERIFIKASI":
      return "default" as const;

    case "DIBATALKAN":
      return "destructive" as const;

    case "DRAFT":
    default:
      return "outline" as const;
  }
}

type GetKematianColumnsOptions = {
  canManage: boolean;
  onDetail: (kematian: KematianListItem) => void;
  onEdit: (kematian: KematianListItem) => void;
  onDelete: (kematian: KematianListItem) => void;
};

export function getKematianColumns({
  canManage,
  onDetail,
  onEdit,
  onDelete,
}: GetKematianColumnsOptions): ColumnDef<KematianListItem>[] {
  return [
    {
      id: "namaJemaat",
      accessorFn: (row) => row.jemaat.namaLengkap,

      header: ({ column }) => <DataTableColumnHeader column={column} title="Jemaat" />,

      cell: ({ row }) => (
        <div className="min-w-48">
          <div className="font-medium">{row.original.jemaat.namaLengkap}</div>

          <div className="text-xs text-muted-foreground">
            {row.original.jemaat.nomorIndukGereja}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "tanggalMeninggal",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal meninggal" />,

      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <div>{formatDate(row.original.tanggalMeninggal)}</div>

          {row.original.waktuMeninggal ? (
            <div className="text-xs text-muted-foreground">Pukul {row.original.waktuMeninggal}</div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "umurSaatMeninggal",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Umur" />,

      cell: ({ row }) =>
        row.original.umurSaatMeninggal !== null ? `${row.original.umurSaatMeninggal} tahun` : "-",
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
      accessorKey: "nomorSuratKematian",

      header: ({ column }) => <DataTableColumnHeader column={column} title="No. surat" />,

      cell: ({ row }) => row.original.nomorSuratKematian ?? "-",
    },
    {
      accessorKey: "status",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,

      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {statusKematianLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,

      cell: ({ row }) => {
        const kematian = row.original;
        const isFinal = kematian.status === "TERVERIFIKASI";

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Tindakan pencatatan kematian"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDetail(kematian)}>
                  <Eye />
                  Detail
                </DropdownMenuItem>

                {canManage && !isFinal ? (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => onEdit(kematian)}>
                      <Pencil />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(kematian)}
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
