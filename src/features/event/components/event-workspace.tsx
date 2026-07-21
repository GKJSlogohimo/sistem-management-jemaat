"use client";

import {
  CalendarDays,
  CheckSquare,
  ListOrdered,
  MapPin,
  MonitorUp,
  PlayCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatEventDateTime,
  jenisEventLabels,
  statusEventLabels,
} from "@/features/event/constants";
import { useEventDetailQuery } from "@/features/event/hooks/use-event-query";
import { PesertaEventTable } from "@/features/peserta-event/components/peserta-event-table";

import { useEventRealtime } from "../hooks/use-event-realtime";

type Props = {
  eventId: string;
};

export function EventWorkspace({ eventId }: Props) {
  const query = useEventDetailQuery(eventId);

  useEventRealtime(eventId);

  if (query.isPending) {
    return <div className="h-120 animate-pulse rounded-xl bg-muted" />;
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Event tidak dapat dimuat</AlertTitle>

        <AlertDescription>{query.error.message}</AlertDescription>
      </Alert>
    );
  }

  const event = query.data.data;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-2">
          {event.gunakanCheckIn ? (
            <Button asChild>
              <Link href={`/event/${event.id}/operasional`}>
                <PlayCircle />
                Buka operasional
              </Link>
            </Button>
          ) : null}

          {event.gunakanAntrean ? (
            <Button variant="outline" asChild>
              <Link href={`/event/${event.id}/display`} target="_blank" rel="noopener noreferrer">
                <MonitorUp />
                Buka display
              </Link>
            </Button>
          ) : null}

          <Button variant="outline" asChild>
            <Link href="/event">Kelola Event</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge>{statusEventLabels[event.status]}</Badge>

              <Badge variant="outline">{jenisEventLabels[event.jenis]}</Badge>

              <Badge variant="outline">{event.kategoriEvent.nama}</Badge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">{event.nama}</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {event.unitGereja.kode} — {event.unitGereja.nama}
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={`/event?edit=${event.id}`}>Edit Event</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            Jadwal
          </div>

          <p className="font-medium">{formatEventDateTime(event.tanggalMulai)}</p>

          {event.tanggalSelesai ? (
            <p className="mt-1 text-sm text-muted-foreground">
              sampai {formatEventDateTime(event.tanggalSelesai)}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            Lokasi
          </div>

          <p className="font-medium">{event.lokasi ?? "-"}</p>
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Peserta
          </div>

          <p className="font-medium">
            {event.jumlahPeserta}
            {event.kapasitas ? ` dari ${event.kapasitas}` : ""}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-2 text-sm text-muted-foreground">Fitur operasional</div>

          <div className="flex flex-wrap gap-2">
            {event.gunakanPencatatanPeserta ? (
              <Badge variant="outline">
                <Users />
                Peserta
              </Badge>
            ) : null}

            {event.gunakanCheckIn ? (
              <Badge variant="outline">
                <CheckSquare />
                Check-in
              </Badge>
            ) : null}

            {event.gunakanAntrean ? (
              <Badge variant="outline">
                <ListOrdered />
                Antrean
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {event.deskripsi ? (
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Deskripsi</h2>

          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {event.deskripsi}
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Peserta Event</h2>

          <p className="text-sm text-muted-foreground">
            Kelola registrasi Jemaat dan peserta nonjemaat.
          </p>
        </div>

        <PesertaEventTable event={event} />
      </div>
    </div>
  );
}
