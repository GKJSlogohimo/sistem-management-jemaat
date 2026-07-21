import { assertCanAccessUnit, EventActor } from "@/features/event/server/event.service";
import { StatusPesertaEvent } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type { LaporanEvent } from "../types/laporan-event.types";

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Number((total / values.length).toFixed(2));
}

function differenceInMinutes(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 60_000);
}

export async function getLaporanEvent(actor: EventActor, eventId: string): Promise<LaporanEvent> {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      nama: true,
      jenis: true,
      status: true,
      lokasi: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      gunakanCheckIn: true,
      gunakanAntrean: true,

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },

      kategoriEvent: {
        select: {
          id: true,
          nama: true,
        },
      },

      peserta: {
        where: {
          deletedAt: null,
        },

        orderBy: [
          {
            nomorAntrian: "asc",
          },
          {
            waktuTercatat: "asc",
          },
        ],

        select: {
          id: true,
          namaPesertaSnapshot: true,
          jenisPeserta: true,
          nomorAntrian: true,
          status: true,
          waktuTercatat: true,
          waktuCheckIn: true,
          waktuDipanggil: true,
          waktuSelesai: true,
          catatan: true,

          jemaat: {
            select: {
              nik: true,
              alamat: true,

              keluarga: {
                select: {
                  alamat: true,
                },
              },
            },
          },

          pesertaUmum: {
            select: {
              nik: true,
              alamat: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, event.unitGerejaId);

  const ringkasanStatus: Record<StatusPesertaEvent, number> = {
    TERCATAT: 0,
    HADIR: 0,
    MENUNGGU: 0,
    DIPANGGIL: 0,
    SELESAI: 0,
    BATAL: 0,
  };

  const waktuTunggu: number[] = [];

  const waktuPelayanan: number[] = [];

  for (const peserta of event.peserta) {
    ringkasanStatus[peserta.status] += 1;

    if (peserta.waktuCheckIn && peserta.waktuDipanggil) {
      waktuTunggu.push(differenceInMinutes(peserta.waktuCheckIn, peserta.waktuDipanggil));
    }

    if (peserta.waktuDipanggil && peserta.waktuSelesai) {
      waktuPelayanan.push(differenceInMinutes(peserta.waktuDipanggil, peserta.waktuSelesai));
    }
  }

  const totalPeserta = event.peserta.length;

  const totalHadir =
    ringkasanStatus.HADIR +
    ringkasanStatus.MENUNGGU +
    ringkasanStatus.DIPANGGIL +
    ringkasanStatus.SELESAI;

  const persentaseKehadiran =
    totalPeserta > 0 ? Number(((totalHadir / totalPeserta) * 100).toFixed(2)) : 0;

  return {
    event: {
      id: event.id,
      nama: event.nama,
      jenis: event.jenis,
      status: event.status,
      lokasi: event.lokasi,
      tanggalMulai: event.tanggalMulai.toISOString(),

      tanggalSelesai: event.tanggalSelesai?.toISOString() ?? null,

      gunakanCheckIn: event.gunakanCheckIn,

      gunakanAntrean: event.gunakanAntrean,

      unitGereja: event.unitGereja,

      kategoriEvent: event.kategoriEvent,
    },

    ringkasanStatus,

    ringkasan: {
      totalPeserta,
      totalHadir,

      totalSelesai: ringkasanStatus.SELESAI,

      totalBatal: ringkasanStatus.BATAL,

      persentaseKehadiran,

      rataRataTungguMenit: average(waktuTunggu),

      rataRataPelayananMenit: average(waktuPelayanan),
    },

    peserta: event.peserta.map((peserta) => ({
      id: peserta.id,

      nama: peserta.namaPesertaSnapshot,

      nik: peserta.jemaat?.nik ?? peserta.pesertaUmum?.nik ?? null,

      alamat:
        peserta.jemaat?.alamat ??
        peserta.jemaat?.keluarga.alamat ??
        peserta.pesertaUmum?.alamat ??
        null,

      jenisPeserta: peserta.jenisPeserta,

      nomorAntrian: peserta.nomorAntrian,

      status: peserta.status,

      waktuTercatat: peserta.waktuTercatat.toISOString(),

      waktuCheckIn: peserta.waktuCheckIn?.toISOString() ?? null,

      waktuDipanggil: peserta.waktuDipanggil?.toISOString() ?? null,

      waktuSelesai: peserta.waktuSelesai?.toISOString() ?? null,

      catatan: peserta.catatan,
    })),
  };
}
