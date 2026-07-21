/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Maximize2, Minimize2, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { QueueCalledPayload } from "@/app/api/realtime/event-realtime";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEventDisplayRealtime } from "@/features/event/hooks/use-event-display-realtime";

import { useOperasionalEventQuery } from "../hooks/use-operasional-event";
import { speakQueueAnnouncement, stopQueueAnnouncement } from "../lib/speech-announcement";

type EventDisplayProps = {
  eventId: string;
};

export function EventDisplay({ eventId }: EventDisplayProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  const soundEnabledRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [now, setNow] = useState<Date | null>(null);

  const query = useOperasionalEventQuery(eventId, "");

  useEffect(() => {
    setNow(new Date());

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleQueueCalled = useCallback((payload: QueueCalledPayload) => {
    if (!soundEnabledRef.current) {
      return;
    }

    speakQueueAnnouncement({
      nomorAntrian: payload.nomorAntrian,

      tujuan: payload.tujuan,

      ulang: 2,
    });
  }, []);

  const realtime = useEventDisplayRealtime({
    eventId,
    onQueueCalled: handleQueueCalled,
  });

  async function activateDisplay() {
    soundEnabledRef.current = true;

    setSoundEnabled(true);

    /*
     * Panggilan tes sekaligus
     * mengaktifkan speech synthesis
     * melalui interaksi pengguna.
     */
    speakQueueAnnouncement({
      nomorAntrian: 1,
      tujuan: "meja pelayanan",
      ulang: 1,
    });

    if (document.fullscreenEnabled && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        /*
         * Display tetap dapat digunakan
         * walaupun fullscreen ditolak.
         */
      }
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Tidak memblokir display.
    }
  }

  function disableSound() {
    soundEnabledRef.current = false;

    setSoundEnabled(false);
    stopQueueAnnouncement();
  }

  const state = query.data?.data;

  const currentCalled = useMemo(() => {
    if (!state) {
      return null;
    }

    return (
      [...state.dipanggil].sort((left, right) => {
        const leftTime = left.waktuDipanggil ? new Date(left.waktuDipanggil).getTime() : 0;

        const rightTime = right.waktuDipanggil ? new Date(right.waktuDipanggil).getTime() : 0;

        return rightTime - leftTime;
      })[0] ?? null
    );
  }, [state]);

  const waitingParticipants = state?.menunggu.slice(0, 6) ?? [];

  if (query.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 text-white">
        <p className="text-2xl">Memuat display antrean...</p>
      </main>
    );
  }

  if (query.isError || !state) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-6 text-white">
        <Alert variant="destructive" className="max-w-xl">
          <AlertTitle>Display tidak dapat dimuat</AlertTitle>

          <AlertDescription>
            {query.error?.message ?? "Data Event tidak tersedia."}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-950 text-white">
      <header className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-slate-950 hover:bg-white">Display Antrean</Badge>

            <Badge variant="outline" className="border-white/20 text-white">
              {state.event.gunakanAntrean ? "Menggunakan antrean" : "Tanpa antrean"}
            </Badge>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight lg:text-4xl">{state.event.nama}</h1>

          <p className="mt-1 text-base text-slate-300 lg:text-lg">
            {state.event.unitGereja.kode} — {state.event.unitGereja.nama}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              realtime.connected
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/50 bg-amber-400/10 text-amber-300"
            }
          >
            {realtime.connected ? <Wifi /> : <WifiOff />}

            {realtime.connected ? "Realtime aktif" : "Realtime terputus"}
          </Badge>

          <Badge variant="outline" className="border-white/20 font-mono text-base text-white">
            {now
              ? new Intl.DateTimeFormat("id-ID", {
                  timeZone: "Asia/Jakarta",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hourCycle: "h23",
                }).format(now)
              : "--:--:--"}
          </Badge>

          {soundEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={disableSound}
            >
              <Volume2 />
              Suara aktif
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                void activateDisplay();
              }}
            >
              <VolumeX />
              Aktifkan suara
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              void toggleFullscreen();
            }}
          >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}

            <span className="sr-only">
              {isFullscreen ? "Keluar layar penuh" : "Masuk layar penuh"}
            </span>
          </Button>
        </div>
      </header>

      {realtime.connectionError ? (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <AlertTitle>Koneksi realtime bermasalah</AlertTitle>

            <AlertDescription>
              {realtime.connectionError}
              Data masih diperbarui melalui polling cadangan.
            </AlertDescription>
          </Alert>
        </div>
      ) : null}

      {!soundEnabled ? (
        <div className="mx-6 mt-4 flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-200">Suara belum diaktifkan</p>

            <p className="text-sm text-amber-100/80">
              Tekan tombol aktifkan satu kali sebelum display digunakan.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              void activateDisplay();
            }}
          >
            <Volume2 />
            Aktifkan suara dan fullscreen
          </Button>
        </div>
      ) : null}

      <div className="grid min-h-[calc(100dvh-130px)] grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section
          aria-live="polite"
          className="flex min-h-[55dvh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/4 p-6 text-center"
        >
          <p className="text-lg font-semibold uppercase tracking-[0.3em] text-slate-300 lg:text-2xl">
            Nomor antrean
          </p>

          {currentCalled ? (
            <>
              <p className="my-4 font-mono text-[clamp(8rem,27vw,22rem)] font-black leading-none tracking-tighter text-white">
                {currentCalled.nomorAntrian}
              </p>

              <p className="max-w-5xl text-[clamp(2rem,5vw,5rem)] font-bold leading-tight">
                {currentCalled.nama}
              </p>

              <p className="mt-5 text-xl text-slate-300 lg:text-3xl">
                Silakan menuju meja pelayanan
              </p>
            </>
          ) : (
            <div className="py-20">
              <p className="text-[clamp(3rem,8vw,8rem)] font-black leading-tight text-slate-500">
                MENUNGGU
              </p>

              <p className="mt-4 text-xl text-slate-400 lg:text-3xl">
                Belum ada peserta yang dipanggil
              </p>
            </div>
          )}
        </section>

        <aside className="flex flex-col rounded-3xl border border-white/10 bg-white/4 p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold">Antrean Berikutnya</h2>

              <p className="mt-1 text-sm text-slate-400">Urut berdasarkan nomor antrean</p>
            </div>

            <Badge className="bg-white text-slate-950 hover:bg-white">
              {state.ringkasan.MENUNGGU} menunggu
            </Badge>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {waitingParticipants.map((peserta) => (
              <div
                key={peserta.id}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/4 p-4"
              >
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-2xl font-black text-slate-950">
                  {peserta.nomorAntrian}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold">{peserta.nama}</p>

                  <p className="mt-1 text-sm text-slate-400">Menunggu dipanggil</p>
                </div>
              </div>
            ))}

            {waitingParticipants.length === 0 ? (
              <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-white/10">
                <p className="text-center text-lg text-slate-500">
                  Tidak ada antrean yang menunggu
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
            <div className="rounded-xl bg-white/4 p-3">
              <p className="text-2xl font-bold">{state.ringkasan.TERCATAT}</p>

              <p className="text-xs text-slate-400">Belum check-in</p>
            </div>

            <div className="rounded-xl bg-white/4 p-3">
              <p className="text-2xl font-bold">{state.ringkasan.DIPANGGIL}</p>

              <p className="text-xs text-slate-400">Dipanggil</p>
            </div>

            <div className="rounded-xl bg-white/4 p-3">
              <p className="text-2xl font-bold">{state.ringkasan.SELESAI}</p>

              <p className="text-xs text-slate-400">Selesai</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
