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

import type { PernikahanListItem } from "../types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

type PernikahanDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pernikahan: PernikahanListItem | null;
};

export function PernikahanDetailDialog({
  open,
  onOpenChange,
  pernikahan,
}: PernikahanDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Pernikahan</DialogTitle>
          <DialogDescription>Informasi pencatatan pernikahan gerejawi.</DialogDescription>
        </DialogHeader>

        {pernikahan ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <DetailRow
                label="Unit pencatatan"
                value={`${pernikahan.unitGereja.kode} — ${pernikahan.unitGereja.nama}`}
              />
              <DetailRow label="Nomor pencatatan" value={pernikahan.nomorPencatatan} />
              <DetailRow label="Nomor sertifikat" value={pernikahan.nomorSertifikat} />
              <DetailRow label="Tanggal" value={formatDate(pernikahan.tanggalPernikahan)} />
              <DetailRow label="Tempat" value={pernikahan.tempatPernikahan} />
              <DetailRow label="Pelayan" value={pernikahan.namaPelayan} />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Pihak pertama" value={pernikahan.namaPihakSatu} />
              <DetailRow
                label="Status pihak pertama"
                value={
                  pernikahan.jemaatPihakSatu
                    ? `Jemaat — ${pernikahan.jemaatPihakSatu.nomorIndukGereja}`
                    : "Pihak luar"
                }
              />
              <DetailRow label="Pihak kedua" value={pernikahan.namaPihakDua} />
              <DetailRow
                label="Status pihak kedua"
                value={
                  pernikahan.jemaatPihakDua
                    ? `Jemaat — ${pernikahan.jemaatPihakDua.nomorIndukGereja}`
                    : "Pihak luar"
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Saksi pertama" value={pernikahan.namaSaksiSatu} />
              <DetailRow label="Saksi kedua" value={pernikahan.namaSaksiDua} />
              <DetailRow label="Keterangan" value={pernikahan.keterangan} />

              <DetailRow
                label="Dokumen"
                value={
                  pernikahan.dokumen && isHttpUrl(pernikahan.dokumen) ? (
                    <Button asChild variant="link" className="h-auto p-0">
                      <a href={pernikahan.dokumen} target="_blank" rel="noreferrer">
                        Buka dokumen
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  ) : (
                    pernikahan.dokumen
                  )
                }
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
