"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ListOrdered,
  Phone,
  Search,
  UserCheck,
  UserRoundX,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventRealtime } from "@/features/event/hooks/use-event-realtime";

import {
  useOperasionalEventMutation,
  useOperasionalEventQuery,
} from "../hooks/use-operasional-event";
import type { ExecuteOperasionalEventInput, OperasionalParticipant } from "../types";
import { CheckInDialog } from "./check-in-dialog";

type Props = {
  eventId: string;
};

function ParticipantIdentity({ peserta }: { peserta: OperasionalParticipant }) {
  return (
    <div>
      <p className="font-medium">{peserta.nama}</p>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{peserta.jenisPeserta === "JEMAAT" ? "Jemaat" : "Nonjemaat"}</span>

        {peserta.nik ? <span>NIK {peserta.nik}</span> : null}

        {peserta.noHp ? (
          <span className="flex items-center gap-1">
            <Phone className="size-3" />
            {peserta.noHp}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function OperasionalEventWorkspace({ eventId }: Props) {
  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search);

  const query = useOperasionalEventQuery(eventId, deferredSearch);

  const mutation = useOperasionalEventMutation(eventId);

  const [selectedCheckIn, setSelectedCheckIn] = useState<OperasionalParticipant | null>(null);

  const realtime = useEventRealtime(eventId);

  async function execute(values: ExecuteOperasionalEventInput) {
    await mutation.mutateAsync(values);
  }

  if (query.isPending) {
    return <div className="h-130 animate-pulse rounded-xl bg-muted" />;
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Operasional tidak dapat dimuat</AlertTitle>

        <AlertDescription>{query.error.message}</AlertDescription>
      </Alert>
    );
  }

  const state = query.data.data;

  const eventActive = state.event.status === "DIBUKA" && state.event.gunakanCheckIn;

  return (
    <div className="space-y-6">
      {realtime.connectionError ? (
        <Alert variant="destructive">
          <AlertTitle>Koneksi realtime bermasalah</AlertTitle>

          <AlertDescription>{realtime.connectionError}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Badge variant={realtime.connected ? "default" : "secondary"}>
          {realtime.connected ? "Realtime aktif" : "Realtime terputus"}
        </Badge>

        <Button variant="ghost" asChild className="-ml-3 mb-3">
          <Link href={`/event/${eventId}`}>
            <ArrowLeft />
            Kembali ke detail Event
          </Link>
        </Button>

        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>Operasional Event</Badge>

            {state.event.gunakanAntrean ? (
              <Badge variant="outline">
                <ListOrdered />
                Menggunakan antrean
              </Badge>
            ) : (
              <Badge variant="outline">Tanpa antrean</Badge>
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">{state.event.nama}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {state.event.unitGereja.kode} — {state.event.unitGereja.nama}
          </p>
        </div>
      </div>

      {!state.event.gunakanCheckIn ? (
        <Alert>
          <AlertTitle>Check-in tidak aktif</AlertTitle>

          <AlertDescription>
            Aktifkan fitur check-in pada konfigurasi Event terlebih dahulu.
          </AlertDescription>
        </Alert>
      ) : null}

      {state.event.status !== "DIBUKA" ? (
        <Alert>
          <AlertTitle>Operasional ditutup</AlertTitle>

          <AlertDescription>
            Tindakan operasional hanya tersedia saat Event berstatus Dibuka.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {(
          [
            ["TERCATAT", "Belum check-in"],
            ["HADIR", "Hadir"],
            ["MENUNGGU", "Menunggu"],
            ["DIPANGGIL", "Dipanggil"],
            ["SELESAI", "Selesai"],
            ["BATAL", "Batal"],
          ] as const
        ).map(([status, label]) => (
          <div key={status} className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>

            <p className="mt-1 text-2xl font-semibold">{state.ringkasan[status]}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Check-in peserta</h2>

            <p className="text-sm text-muted-foreground">
              Cari peserta yang sudah tercatat, lalu lakukan check-in.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Cari nama, NIK, atau nomor induk..."
            />
          </div>
        </div>

        <div className="divide-y rounded-lg border">
          {state.tercatat.map((peserta) => (
            <div
              key={peserta.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <ParticipantIdentity peserta={peserta} />

              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={!eventActive || mutation.isPending}
                  onClick={() => setSelectedCheckIn(peserta)}
                >
                  <UserCheck />
                  Check-in
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!eventActive || mutation.isPending}
                  onClick={() => {
                    void execute({
                      action: "BATAL",
                      pesertaId: peserta.id,
                    });
                  }}
                >
                  <UserRoundX />
                  Batal
                </Button>
              </div>
            </div>
          ))}

          {state.tercatat.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Tidak ada peserta yang menunggu check-in.
            </p>
          ) : null}
        </div>
      </section>

      {state.event.gunakanAntrean ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-4 rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Antrean menunggu</h2>

                <p className="text-sm text-muted-foreground">Urut berdasarkan nomor antrean.</p>
              </div>

              <Button
                type="button"
                disabled={!eventActive || mutation.isPending || state.menunggu.length === 0}
                onClick={() => {
                  void execute({
                    action: "PANGGIL_BERIKUTNYA",
                  });
                }}
              >
                <Volume2 />
                Panggil berikutnya
              </Button>
            </div>

            <div className="max-h-130 space-y-2 overflow-y-auto">
              {state.menunggu.map((peserta) => (
                <div key={peserta.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xl font-semibold">
                    {peserta.nomorAntrian}
                  </div>

                  <div className="min-w-0 flex-1">
                    <ParticipantIdentity peserta={peserta} />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={!eventActive || mutation.isPending}
                      onClick={() => {
                        void execute({
                          action: "PANGGIL",
                          pesertaId: peserta.id,
                        });
                      }}
                    >
                      <Volume2 />
                      Panggil
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={!eventActive || mutation.isPending}
                      onClick={() => {
                        void execute({
                          action: "BATAL",
                          pesertaId: peserta.id,
                        });
                      }}
                    >
                      <UserRoundX />
                    </Button>
                  </div>
                </div>
              ))}

              {state.menunggu.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada peserta dalam antrean.
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold">Sedang dipanggil</h2>

              <p className="text-sm text-muted-foreground">Peserta yang sedang dilayani.</p>
            </div>

            <div className="space-y-3">
              {state.dipanggil.map((peserta) => (
                <div key={peserta.id} className="rounded-xl border-2 border-primary p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-2xl font-bold text-primary-foreground">
                      {peserta.nomorAntrian}
                    </div>

                    <div className="flex-1">
                      <ParticipantIdentity peserta={peserta} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={!eventActive || mutation.isPending}
                      onClick={() => {
                        void execute({
                          action: "SELESAI",
                          pesertaId: peserta.id,
                        });
                      }}
                    >
                      <CheckCircle2 />
                      Selesai
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={!eventActive || mutation.isPending}
                      onClick={() => {
                        void execute({
                          action: "KEMBALIKAN",
                          pesertaId: peserta.id,
                        });
                      }}
                    >
                      <Clock3 />
                      Kembali menunggu
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      disabled={!eventActive || mutation.isPending}
                      onClick={() => {
                        void execute({
                          action: "BATAL",
                          pesertaId: peserta.id,
                        });
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ))}

              {state.dipanggil.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Belum ada peserta yang dipanggil.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Peserta hadir</h2>

            <p className="text-sm text-muted-foreground">
              Event tanpa antrean. Tandai selesai setelah peserta selesai dilayani.
            </p>
          </div>

          <div className="divide-y rounded-lg border">
            {state.hadir.map((peserta) => (
              <div
                key={peserta.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <ParticipantIdentity peserta={peserta} />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={!eventActive || mutation.isPending}
                    onClick={() => {
                      void execute({
                        action: "SELESAI",
                        pesertaId: peserta.id,
                      });
                    }}
                  >
                    <CheckCircle2 />
                    Selesai
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!eventActive || mutation.isPending}
                    onClick={() => {
                      void execute({
                        action: "BATAL",
                        pesertaId: peserta.id,
                      });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ))}

            {state.hadir.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Belum ada peserta hadir.
              </p>
            ) : null}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Pelayanan selesai</h2>

          <p className="text-sm text-muted-foreground">
            Menampilkan 20 peserta terakhir yang selesai.
          </p>
        </div>

        <div className="divide-y rounded-lg border">
          {state.selesai.map((peserta) => (
            <div key={peserta.id} className="flex items-center gap-3 p-4">
              <CheckCircle2 className="size-5 text-primary" />

              <div className="flex-1">
                <ParticipantIdentity peserta={peserta} />
              </div>

              {peserta.nomorAntrian ? (
                <Badge variant="outline">Antrean {peserta.nomorAntrian}</Badge>
              ) : null}
            </div>
          ))}

          {state.selesai.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Belum ada pelayanan selesai.
            </p>
          ) : null}
        </div>
      </section>

      <CheckInDialog
        key={selectedCheckIn?.id ?? "none"}
        open={Boolean(selectedCheckIn)}
        eventId={eventId}
        gunakanAntrean={state.event.gunakanAntrean}
        nomorAntrianBerikutnya={state.nomorAntrianBerikutnya}
        peserta={selectedCheckIn}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCheckIn(null);
          }
        }}
      />
    </div>
  );
}
