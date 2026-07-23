"use client";

import { Building2, House, MapPin, Phone, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { KeluargaListItem } from "../types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

type DetailRowProps = {
  label: string;
  value: ReactNode | null | undefined;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="min-w-0 text-sm font-medium">{value ?? "-"}</div>
    </div>
  );
}

type KeluargaDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keluarga: KeluargaListItem | null;
  canViewNomorKK: boolean;
};

export function KeluargaDetailDialog({
  open,
  onOpenChange,
  keluarga,
  canViewNomorKK,
}: KeluargaDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Keluarga</DialogTitle>

          <DialogDescription>Informasi keluarga dan Unit Gereja terkait.</DialogDescription>
        </DialogHeader>

        {keluarga ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <House className="size-5 shrink-0 text-muted-foreground" />

                  <h3 className="truncate text-lg font-semibold">{keluarga.namaKepalaKeluarga}</h3>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">Kepala keluarga</p>
              </div>

              <Badge variant="secondary">{keluarga.jumlahAnggota} anggota</Badge>
            </div>

            <div className="space-y-3">
              {canViewNomorKK ? <DetailRow label="Nomor KK" value={keluarga.nomorKK} /> : null}

              <DetailRow label="Kepala keluarga" value={keluarga.namaKepalaKeluarga} />

              <DetailRow
                label="Unit gereja"
                value={
                  <span className="inline-flex items-start gap-2">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <span>
                      {keluarga.unitGereja.kode}
                      {" — "}
                      {keluarga.unitGereja.nama}
                    </span>
                  </span>
                }
              />

              <DetailRow
                label="Jumlah anggota"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4 shrink-0 text-muted-foreground" />

                    {keluarga.jumlahAnggota}
                  </span>
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Alamat"
                value={
                  keluarga.alamat ? (
                    <span className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      <span className="whitespace-pre-wrap">{keluarga.alamat}</span>
                    </span>
                  ) : null
                }
              />

              <DetailRow
                label="Nomor HP"
                value={
                  keluarga.noHp ? (
                    <a
                      href={`tel:${keluarga.noHp}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Phone className="size-4 shrink-0 text-muted-foreground" />

                      {keluarga.noHp}
                    </a>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Dibuat" value={formatDateTime(keluarga.createdAt)} />

              <DetailRow label="Terakhir diperbarui" value={formatDateTime(keluarga.updatedAt)} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
