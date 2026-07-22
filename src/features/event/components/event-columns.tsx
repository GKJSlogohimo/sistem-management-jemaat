"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckSquare, ListOrdered, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

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

import { formatEventDateTime, jenisEventLabels, statusEventLabels } from "../constants";
import type { EventListItem } from "../types";

type Options = {
  canManage: boolean;
  onEdit: (event: EventListItem) => void;
  onDelete: (event: EventListItem) => void;
};

export function getEventColumns({
  canManage,
  onEdit,
  onDelete,
}: Options): ColumnDef<EventListItem>[] {
  const columns: ColumnDef<EventListItem>[] = [
    {
      accessorKey: "nama",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,

      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.nama}</p>

          <p className="text-xs text-muted-foreground">
            {row.original.kategoriEvent.nama} · {jenisEventLabels[row.original.jenis]}
          </p>
        </div>
      ),
    },

    {
      id: "unit",
      header: "Unit Gereja",
      enableSorting: false,

      cell: ({ row }) => (
        <div>
          <p>{row.original.unitGereja.nama}</p>

          <p className="text-xs text-muted-foreground">{row.original.unitGereja.kode}</p>
        </div>
      ),
    },

    {
      accessorKey: "tanggalMulai",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Jadwal" />,

      cell: ({ row }) => (
        <div>
          <p>{formatEventDateTime(row.original.tanggalMulai)}</p>

          {row.original.tanggalSelesai ? (
            <p className="text-xs text-muted-foreground">
              sampai {formatEventDateTime(row.original.tanggalSelesai)}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      id: "operasional",
      header: "Fitur",
      enableSorting: false,

      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.gunakanPencatatanPeserta ? (
            <Badge variant="outline">
              <Users />
              Peserta
            </Badge>
          ) : null}

          {row.original.gunakanCheckIn ? (
            <Badge variant="outline">
              <CheckSquare />
              Check-in
            </Badge>
          ) : null}

          {row.original.gunakanAntrean ? (
            <Badge variant="outline">
              <ListOrdered />
              Antrean
            </Badge>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "jumlahPeserta",

      header: "Peserta",
      enableSorting: false,

      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.jumlahPeserta}
          {row.original.kapasitas ? ` / ${row.original.kapasitas}` : ""}
        </Badge>
      ),
    },

    {
      accessorKey: "status",

      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,

      cell: ({ row }) => (
        <Badge variant={row.original.status === "DIBUKA" ? "default" : "secondary"}>
          {statusEventLabels[row.original.status]}
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
        const event = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon">
                  <MoreHorizontal />

                  <span className="sr-only">Buka menu tindakan</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={`/event/${event.id}`}>
                    <Users />
                    Kelola peserta
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" onClick={() => onDelete(event)}>
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
