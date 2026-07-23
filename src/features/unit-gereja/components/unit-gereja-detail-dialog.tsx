"use client";

import { Mail, MapPin, Phone, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { UnitGerejaListItem } from "../types";

const jenisLabels = {
  INDUK: "Induk",
  SUB_INDUK: "Subinduk",
} as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="min-w-0 text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

type UnitGerejaDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitGereja: UnitGerejaListItem | null;
};

export function UnitGerejaDetailDialog({
  open,
  onOpenChange,
  unitGereja,
}: UnitGerejaDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Unit Gereja</DialogTitle>

          <DialogDescription>
            Informasi lengkap unit gereja dan struktur organisasinya.
          </DialogDescription>
        </DialogHeader>

        {unitGereja ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-semibold">{unitGereja.nama}</div>

                <div className="text-sm text-muted-foreground">{unitGereja.kode}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{jenisLabels[unitGereja.jenis]}</Badge>

                <Badge variant={unitGereja.aktif ? "default" : "secondary"}>
                  {unitGereja.aktif ? "Aktif" : "Tidak aktif"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Kode unit" value={unitGereja.kode} />

              <DetailRow label="Nama unit" value={unitGereja.nama} />

              <DetailRow label="Jenis unit" value={jenisLabels[unitGereja.jenis]} />

              <DetailRow
                label="Unit induk"
                value={
                  unitGereja.parent
                    ? `${unitGereja.parent.kode} — ${unitGereja.parent.nama}`
                    : unitGereja.jenis === "INDUK"
                      ? "Tidak memiliki unit induk"
                      : "-"
                }
              />

              <DetailRow label="Status" value={unitGereja.aktif ? "Aktif" : "Tidak aktif"} />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Alamat"
                value={
                  unitGereja.alamat ? (
                    <span className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      <span className="whitespace-pre-wrap">{unitGereja.alamat}</span>
                    </span>
                  ) : null
                }
              />

              <DetailRow
                label="Nomor HP"
                value={
                  unitGereja.noHp ? (
                    <a
                      href={`tel:${unitGereja.noHp}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Phone className="size-4 text-muted-foreground" />

                      {unitGereja.noHp}
                    </a>
                  ) : null
                }
              />

              <DetailRow
                label="Email"
                value={
                  unitGereja.email ? (
                    <a
                      href={`mailto:${unitGereja.email}`}
                      className="inline-flex items-center gap-2 break-all hover:underline"
                    >
                      <Mail className="size-4 shrink-0 text-muted-foreground" />

                      {unitGereja.email}
                    </a>
                  ) : null
                }
              />

              <DetailRow
                label="Penanggung jawab"
                value={
                  unitGereja.penanggungJawab ? (
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="size-4 text-muted-foreground" />

                      {unitGereja.penanggungJawab}
                    </span>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Dibuat" value={formatDateTime(unitGereja.createdAt)} />

              <DetailRow label="Terakhir diperbarui" value={formatDateTime(unitGereja.updatedAt)} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
