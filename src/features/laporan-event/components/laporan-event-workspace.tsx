"use client";

import { ArrowLeft, Clock3, Download, RefreshCw, UserCheck, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useLaporanEvent } from "../hooks/use-laporan-event";

type LaporanEventWorkspaceProps = {
  eventId: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatMinutes(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(2)} menit`;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "SELESAI") {
    return "default";
  }

  if (status === "BATAL") {
    return "destructive";
  }

  if (status === "TERCATAT") {
    return "outline";
  }

  return "secondary";
}

export function LaporanEventWorkspace({ eventId }: LaporanEventWorkspaceProps) {
  const query = useLaporanEvent(eventId);

  if (query.isPending) {
    return <div className="p-6">Memuat laporan Event...</div>;
  }

  if (query.isError || !query.data?.data) {
    return (
      <div className="p-6 text-destructive">
        {query.error?.message ?? "Laporan Event tidak dapat dimuat."}
      </div>
    );
  }

  const laporan = query.data.data;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href={`/event/${eventId}`}>
              <ArrowLeft />
              Kembali
            </Link>
          </Button>

          <h1 className="mt-2 text-2xl font-bold tracking-tight">Laporan Event</h1>

          <p className="mt-1 text-muted-foreground">{laporan.event.nama}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {laporan.event.unitGereja.kode} — {laporan.event.unitGereja.nama}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            <RefreshCw className={query.isFetching ? "animate-spin" : undefined} />
            Perbarui
          </Button>

          <Button asChild>
            <a href={`/api/event/${eventId}/laporan/export`}>
              <Download />
              Unduh CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>

            <Users className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{laporan.ringkasan.totalPeserta}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Hadir</CardTitle>

            <UserCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{laporan.ringkasan.totalHadir}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {laporan.ringkasan.persentaseKehadiran}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Rata-rata Menunggu</CardTitle>

            <Clock3 className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {formatMinutes(laporan.ringkasan.rataRataTungguMenit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Rata-rata Pelayanan</CardTitle>

            <Clock3 className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {formatMinutes(laporan.ringkasan.rataRataPelayananMenit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Status</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Object.entries(laporan.ringkasanStatus).map(([status, total]) => (
            <div key={status} className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{status}</p>

              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>

                <TableHead>Antrean</TableHead>

                <TableHead>Nama</TableHead>

                <TableHead>Jenis</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Check-in</TableHead>

                <TableHead>Dipanggil</TableHead>

                <TableHead>Selesai</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {laporan.peserta.map((peserta, index) => (
                <TableRow key={peserta.id}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-mono">{peserta.nomorAntrian ?? "-"}</TableCell>

                  <TableCell className="font-medium">{peserta.nama}</TableCell>

                  <TableCell>
                    {peserta.jenisPeserta === "JEMAAT" ? "Jemaat" : "Nonjemaat"}
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(peserta.status)}>{peserta.status}</Badge>
                  </TableCell>

                  <TableCell>{formatDate(peserta.waktuCheckIn)}</TableCell>

                  <TableCell>{formatDate(peserta.waktuDipanggil)}</TableCell>

                  <TableCell>{formatDate(peserta.waktuSelesai)}</TableCell>
                </TableRow>
              ))}

              {laporan.peserta.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Belum ada peserta.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
