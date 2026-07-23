"use client";

import {
  Building2,
  CalendarDays,
  House,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { AlasanTidakAktif, JenisKelamin } from "@/generated/prisma/enums";

import type { JemaatListItem } from "../types";

const jenisKelaminLabels: Record<JenisKelamin, string> = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
};

const alasanTidakAktifLabels: Record<AlasanTidakAktif, string> = {
  MENINGGAL: "Meninggal",
  PINDAH_GEREJA: "Pindah gereja",
  KELUAR_KEANGGOTAAN: "Keluar dari keanggotaan",
  DATA_GANDA: "Data ganda",
  LAINNYA: "Lainnya",
};

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

type JemaatDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jemaat: JemaatListItem | null;
  canViewNik: boolean;
  canViewNomorKK: boolean;
};

export function JemaatDetailDialog({
  open,
  onOpenChange,
  jemaat,
  canViewNik,
  canViewNomorKK,
}: JemaatDetailDialogProps) {
  const tempatTanggalLahir = jemaat
    ? [jemaat.tempatLahir, formatDate(jemaat.tanggalLahir)].filter(Boolean).join(", ")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detail Jemaat</DialogTitle>

          <DialogDescription>
            Informasi identitas, keanggotaan, keluarga, dan kontak Jemaat.
          </DialogDescription>
        </DialogHeader>

        {jemaat ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start">
              <Avatar className="size-16">
                <AvatarImage src={jemaat.foto ?? undefined} alt={jemaat.namaLengkap} />

                <AvatarFallback>{getInitials(jemaat.namaLengkap)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold">{jemaat.namaLengkap}</h3>

                <p className="text-sm text-muted-foreground">{jemaat.nomorIndukGereja}</p>

                {jemaat.namaPanggilan ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nama panggilan: {jemaat.namaPanggilan}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={jemaat.status === "AKTIF" ? "default" : "secondary"}>
                  {jemaat.status === "AKTIF" ? "Aktif" : "Tidak aktif"}
                </Badge>

                <Badge variant="outline">{jenisKelaminLabels[jemaat.jenisKelamin]}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Nomor induk gereja" value={jemaat.nomorIndukGereja} />

              {canViewNik ? <DetailRow label="NIK" value={jemaat.nik} /> : null}

              <DetailRow label="Nama lengkap" value={jemaat.namaLengkap} />

              <DetailRow label="Nama panggilan" value={jemaat.namaPanggilan} />

              <DetailRow label="Jenis kelamin" value={jenisKelaminLabels[jemaat.jenisKelamin]} />

              <DetailRow
                label="Tempat, tanggal lahir"
                value={
                  tempatTanggalLahir ? (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                      {tempatTanggalLahir}
                    </span>
                  ) : null
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Unit gereja"
                value={
                  <span className="inline-flex items-start gap-2">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <span>
                      {jemaat.unitGereja.kode}
                      {" — "}
                      {jemaat.unitGereja.nama}
                    </span>
                  </span>
                }
              />

              <DetailRow
                label="Wilayah"
                value={
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    {jemaat.wilayah.nama}
                  </span>
                }
              />

              <DetailRow
                label="Keluarga"
                value={
                  <span className="inline-flex items-start gap-2">
                    <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                    <span>Keluarga {jemaat.keluarga.namaKepalaKeluarga}</span>
                  </span>
                }
              />

              {canViewNomorKK ? (
                <DetailRow label="Nomor KK" value={jemaat.keluarga.nomorKK} />
              ) : null}
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Alamat"
                value={
                  jemaat.alamat ? (
                    <span className="inline-flex items-start gap-2">
                      <House className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                      <span className="whitespace-pre-wrap">{jemaat.alamat}</span>
                    </span>
                  ) : null
                }
              />

              <DetailRow
                label="Nomor HP"
                value={
                  jemaat.noHp ? (
                    <a
                      href={`tel:${jemaat.noHp}`}
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <Phone className="size-4 shrink-0 text-muted-foreground" />
                      {jemaat.noHp}
                    </a>
                  ) : null
                }
              />

              <DetailRow
                label="Email"
                value={
                  jemaat.email ? (
                    <a
                      href={`mailto:${jemaat.email}`}
                      className="inline-flex items-center gap-2 break-all hover:underline"
                    >
                      <Mail className="size-4 shrink-0 text-muted-foreground" />
                      {jemaat.email}
                    </a>
                  ) : null
                }
              />
            </div>

            {jemaat.status === "TIDAK_AKTIF" ? (
              <>
                <Separator />

                <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-muted-foreground" />

                    <h4 className="text-sm font-semibold">Informasi tidak aktif</h4>
                  </div>

                  <DetailRow
                    label="Tanggal tidak aktif"
                    value={formatDate(jemaat.tanggalTidakAktif)}
                  />

                  <DetailRow
                    label="Alasan"
                    value={
                      jemaat.alasanTidakAktif
                        ? alasanTidakAktifLabels[jemaat.alasanTidakAktif]
                        : null
                    }
                  />

                  <DetailRow
                    label="Keterangan"
                    value={
                      jemaat.keteranganTidakAktif ? (
                        <span className="whitespace-pre-wrap">{jemaat.keteranganTidakAktif}</span>
                      ) : null
                    }
                  />
                </div>
              </>
            ) : null}

            <Separator />

            <div className="space-y-3">
              <DetailRow label="Dibuat" value={formatDateTime(jemaat.createdAt)} />

              <DetailRow label="Terakhir diperbarui" value={formatDateTime(jemaat.updatedAt)} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
