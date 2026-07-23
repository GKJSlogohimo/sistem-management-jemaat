"use client";

import { Building2, MapPin, Users } from "lucide-react";
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

import type { WilayahListItem } from "../types";

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
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="min-w-0 text-sm font-medium">{value ?? "-"}</div>
    </div>
  );
}

type WilayahDetailDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  wilayah: WilayahListItem | null;
};

export function WilayahDetailDialog({ open, onOpenChange, wilayah }: WilayahDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Wilayah</DialogTitle>

          <DialogDescription>
            Informasi wilayah pelayanan dan Unit Gereja terkait.
          </DialogDescription>
        </DialogHeader>

        {wilayah ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-muted-foreground" />

                  <h3 className="text-lg font-semibold">{wilayah.nama}</h3>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">Wilayah pelayanan Jemaat</p>
              </div>

              <Badge variant="secondary">{wilayah.jumlahJemaat} Jemaat</Badge>
            </div>

            <div className="space-y-3">
              <DetailRow label="Nama wilayah" value={wilayah.nama} />

              <DetailRow
                label="Unit gereja"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />

                    <span>
                      {wilayah.unitGereja.kode}
                      {" — "}
                      {wilayah.unitGereja.nama}
                    </span>
                  </span>
                }
              />

              <DetailRow
                label="Jumlah Jemaat"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />

                    {wilayah.jumlahJemaat}
                  </span>
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Keterangan"
                value={
                  wilayah.keterangan ? (
                    <span className="whitespace-pre-wrap">{wilayah.keterangan}</span>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Dibuat" value={formatDateTime(wilayah.createdAt)} />

              <DetailRow label="Diperbarui" value={formatDateTime(wilayah.updatedAt)} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
