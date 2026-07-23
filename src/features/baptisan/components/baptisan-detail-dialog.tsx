"use client";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { BaptisanListItem } from "../types";

const jenisLabels = {
  BAPTIS_ANAK: "Baptis Anak",

  BAPTIS_DEWASA: "Baptis Dewasa",

  SIDI: "Sidi",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

type DetailRowProps = {
  label: string;
  value: React.ReactNode | null | undefined;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

type BaptisanDetailDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  baptisan: BaptisanListItem | null;
};

export function BaptisanDetailDialog({ open, onOpenChange, baptisan }: BaptisanDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Baptisan</DialogTitle>

          <DialogDescription>Informasi pencatatan administrasi gerejawi.</DialogDescription>
        </DialogHeader>

        {baptisan ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <DetailRow label="Nomor induk" value={baptisan.jemaat.nomorIndukGereja} />

              <DetailRow label="Nama jemaat" value={baptisan.jemaat.namaLengkap} />

              <DetailRow
                label="Unit gereja"
                value={`${baptisan.unitGereja.kode} — ${baptisan.unitGereja.nama}`}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Jenis" value={jenisLabels[baptisan.jenis]} />

              <DetailRow label="Tanggal" value={formatDate(baptisan.tanggalBaptisan)} />

              <DetailRow label="Tempat" value={baptisan.tempatBaptisan} />

              <DetailRow label="Nama pelayan" value={baptisan.namaPelayan} />

              <DetailRow label="Nomor sertifikat" value={baptisan.nomorSertifikat} />

              <DetailRow
                label="Dokumen"
                value={
                  baptisan.dokumen ? (
                    <Button asChild variant="link" className="h-auto p-0">
                      <a href={baptisan.dokumen} target="_blank" rel="noreferrer">
                        Buka dokumen
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  ) : null
                }
              />

              <DetailRow label="Keterangan" value={baptisan.keterangan} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
