"use client";

import {
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileText,
  House,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { statusKematianLabels } from "../constants";
import type { KematianListItem } from "../types";

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function getStatusVariant(status: KematianListItem["status"]) {
  switch (status) {
    case "TERVERIFIKASI":
      return "default" as const;

    case "DIBATALKAN":
      return "destructive" as const;

    default:
      return "outline" as const;
  }
}

type DetailRowProps = {
  label: string;
  value: ReactNode | null | undefined;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[210px_1fr] sm:gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="min-w-0 text-sm font-medium">{value ?? "-"}</div>
    </div>
  );
}

type KematianDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kematian: KematianListItem | null;
};

export function KematianDetailDialog({ open, onOpenChange, kematian }: KematianDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Pencatatan Kematian</DialogTitle>

          <DialogDescription>
            Informasi kematian, pelayanan penghiburan, dan pemakaman.
          </DialogDescription>
        </DialogHeader>

        {kematian ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start">
              <Avatar className="size-16">
                <AvatarImage
                  src={kematian.jemaat.foto ?? undefined}
                  alt={kematian.jemaat.namaLengkap}
                />

                <AvatarFallback>{getInitials(kematian.jemaat.namaLengkap)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{kematian.jemaat.namaLengkap}</h3>

                <p className="text-sm text-muted-foreground">{kematian.jemaat.nomorIndukGereja}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {kematian.unitGereja.kode}
                  {" — "}
                  {kematian.unitGereja.nama}
                </p>
              </div>

              <Badge variant={getStatusVariant(kematian.status)}>
                {statusKematianLabels[kematian.status]}
              </Badge>
            </div>

            <div className="space-y-3">
              <DetailRow
                label="Tanggal meninggal"
                value={
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-muted-foreground" />

                    {formatDate(kematian.tanggalMeninggal)}
                  </span>
                }
              />

              <DetailRow
                label="Waktu meninggal"
                value={
                  kematian.waktuMeninggal ? (
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4 text-muted-foreground" />

                      {kematian.waktuMeninggal}
                    </span>
                  ) : null
                }
              />

              <DetailRow
                label="Umur saat meninggal"
                value={
                  kematian.umurSaatMeninggal !== null ? `${kematian.umurSaatMeninggal} tahun` : null
                }
              />

              <DetailRow label="Tempat meninggal" value={kematian.tempatMeninggal} />

              <DetailRow
                label="Penyebab kematian"
                value={
                  kematian.penyebabKematian ? (
                    <span className="whitespace-pre-wrap">{kematian.penyebabKematian}</span>
                  ) : null
                }
              />

              <DetailRow
                label="Unit Gereja"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />

                    {kematian.unitGereja.kode}
                    {" — "}
                    {kematian.unitGereja.nama}
                  </span>
                }
              />

              <DetailRow label="Wilayah" value={kematian.jemaat.wilayah.nama} />

              <DetailRow
                label="Keluarga"
                value={`Keluarga ${kematian.jemaat.keluarga.namaKepalaKeluarga}`}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Surat Kematian dan Rumah Duka</h4>

              <DetailRow label="Nomor surat kematian" value={kematian.nomorSuratKematian} />

              <DetailRow label="Instansi penerbit" value={kematian.instansiPenerbit} />

              <DetailRow
                label="Alamat rumah duka"
                value={
                  kematian.alamatRumahDuka ? (
                    <span className="inline-flex items-start gap-2">
                      <House className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      <span className="whitespace-pre-wrap">{kematian.alamatRumahDuka}</span>
                    </span>
                  ) : null
                }
              />

              <DetailRow
                label="Dokumen surat"
                value={
                  kematian.dokumenSuratKematian && isHttpUrl(kematian.dokumenSuratKematian) ? (
                    <Button asChild variant="link" className="h-auto p-0">
                      <a href={kematian.dokumenSuratKematian} target="_blank" rel="noreferrer">
                        <FileText className="size-4" />
                        Buka dokumen
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  ) : (
                    kematian.dokumenSuratKematian
                  )
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Ibadah Penghiburan</h4>

              <DetailRow label="Tanggal" value={formatDate(kematian.tanggalIbadahPenghiburan)} />

              <DetailRow label="Waktu" value={kematian.waktuIbadahPenghiburan} />

              <DetailRow label="Lokasi" value={kematian.lokasiIbadahPenghiburan} />

              <DetailRow label="Nama pelayan" value={kematian.namaPelayanPenghiburan} />

              <DetailRow label="Tema pelayanan" value={kematian.temaPelayanan} />

              <DetailRow
                label="Catatan pelayanan"
                value={
                  kematian.catatanPelayanan ? (
                    <span className="whitespace-pre-wrap">{kematian.catatanPelayanan}</span>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Pemakaman</h4>

              <DetailRow label="Tanggal" value={formatDate(kematian.tanggalPemakaman)} />

              <DetailRow label="Waktu" value={kematian.waktuPemakaman} />

              <DetailRow label="Nama tempat pemakaman" value={kematian.namaTempatPemakaman} />

              <DetailRow
                label="Lokasi pemakaman"
                value={
                  kematian.lokasiPemakaman ? (
                    <span className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      {kematian.lokasiPemakaman}
                    </span>
                  ) : null
                }
              />

              <DetailRow label="Nama pelayan" value={kematian.namaPelayanPemakaman} />

              <DetailRow label="Nomor lokasi makam" value={kematian.nomorLokasiMakam} />

              <DetailRow
                label="Keterangan pemakaman"
                value={
                  kematian.keteranganPemakaman ? (
                    <span className="whitespace-pre-wrap">{kematian.keteranganPemakaman}</span>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Status pencatatan" value={statusKematianLabels[kematian.status]} />

              <DetailRow
                label="Keterangan"
                value={
                  kematian.keterangan ? (
                    <span className="whitespace-pre-wrap">{kematian.keterangan}</span>
                  ) : null
                }
              />

              <DetailRow label="Dibuat" value={formatDateTime(kematian.createdAt)} />

              <DetailRow label="Terakhir diperbarui" value={formatDateTime(kematian.updatedAt)} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
