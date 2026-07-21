import "server-only";

import { assertCanAccessUnit, type EventActor } from "@/features/event/server/event.service";
import { Prisma, StatusEvent, StatusPesertaEvent } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  ExecuteOperasionalEventInput,
  OperasionalEventState,
  OperasionalParticipant,
  OperasionalParticipantStatus,
} from "../types";

const operasionalParticipantSelect = {
  id: true,
  eventId: true,
  jenisPeserta: true,
  namaPesertaSnapshot: true,
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
      noHp: true,
    },
  },

  pesertaUmum: {
    select: {
      nik: true,
      noHp: true,
    },
  },
} satisfies Prisma.PesertaEventSelect;

type OperasionalParticipantPayload = Prisma.PesertaEventGetPayload<{
  select: typeof operasionalParticipantSelect;
}>;

type TransactionClient = Prisma.TransactionClient;

function mapParticipant(peserta: OperasionalParticipantPayload): OperasionalParticipant {
  const source = peserta.jenisPeserta === "JEMAAT" ? peserta.jemaat : peserta.pesertaUmum;

  return {
    id: peserta.id,
    eventId: peserta.eventId,

    jenisPeserta: peserta.jenisPeserta,

    nama: peserta.namaPesertaSnapshot,

    nik: source?.nik ?? null,
    noHp: source?.noHp ?? null,

    nomorAntrian: peserta.nomorAntrian,

    status: peserta.status,

    waktuTercatat: peserta.waktuTercatat.toISOString(),

    waktuCheckIn: peserta.waktuCheckIn?.toISOString() ?? null,

    waktuDipanggil: peserta.waktuDipanggil?.toISOString() ?? null,

    waktuSelesai: peserta.waktuSelesai?.toISOString() ?? null,

    catatan: peserta.catatan,
  };
}

async function getOperationalEvent(actor: EventActor, eventId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      nama: true,
      unitGerejaId: true,
      status: true,

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
    },
  });

  if (!event) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, event.unitGerejaId);

  return event;
}

async function assertOperationalEvent(tx: TransactionClient, eventId: string) {
  const event = await tx.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      status: true,
      gunakanCheckIn: true,
      gunakanAntrean: true,
    },
  });

  if (!event) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (!event.gunakanCheckIn) {
    throw new AppError("Event ini tidak menggunakan fitur check-in.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (event.status !== StatusEvent.DIBUKA) {
    throw new AppError("Operasional hanya dapat dilakukan ketika Event berstatus Dibuka.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  return event;
}

async function runSerializable<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < 3;

      if (retryable) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Operasional gagal diproses karena terjadi konflik transaksi.", {
    status: 409,
    code: "CONFLICT",
  });
}

async function getUpdatedParticipant(tx: TransactionClient, pesertaId: string) {
  const peserta = await tx.pesertaEvent.findUnique({
    where: {
      id: pesertaId,
    },

    select: operasionalParticipantSelect,
  });

  if (!peserta) {
    throw new AppError("Peserta Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return peserta;
}

async function changeParticipantStatus(
  tx: TransactionClient,
  options: {
    eventId: string;
    pesertaId: string;

    allowedStatuses: StatusPesertaEvent[];

    data: Prisma.PesertaEventUpdateManyMutationInput;
  },
) {
  const updated = await tx.pesertaEvent.updateMany({
    where: {
      id: options.pesertaId,
      eventId: options.eventId,
      deletedAt: null,

      status: {
        in: options.allowedStatuses,
      },
    },

    data: options.data,
  });

  if (updated.count !== 1) {
    throw new AppError("Status peserta sudah berubah atau tindakan tidak dapat dilakukan.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  return getUpdatedParticipant(tx, options.pesertaId);
}

function createSearchFilter(q: string): Prisma.PesertaEventWhereInput {
  if (!q) {
    return {};
  }

  return {
    OR: [
      {
        namaPesertaSnapshot: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        jemaat: {
          is: {
            nik: {
              contains: q,
            },
          },
        },
      },
      {
        jemaat: {
          is: {
            nomorIndukGereja: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      },
      {
        pesertaUmum: {
          is: {
            nik: {
              contains: q,
            },
          },
        },
      },
      {
        pesertaUmum: {
          is: {
            noHp: {
              contains: q,
            },
          },
        },
      },
    ],
  };
}

export async function getOperasionalEventState(
  actor: EventActor,
  eventId: string,
  q: string,
): Promise<OperasionalEventState> {
  const event = await getOperationalEvent(actor, eventId);

  const baseWhere: Prisma.PesertaEventWhereInput = {
    eventId,
    deletedAt: null,
  };

  const [groupedStatus, queueAggregate, tercatat, hadir, menunggu, dipanggil, selesai] =
    await prisma.$transaction([
      prisma.pesertaEvent.groupBy({
        by: ["status"],

        where: baseWhere,

        _count: {
          _all: true,
        },
      }),

      /*
       * Sertakan seluruh nomor yang pernah dipakai.
       * Nomor batal tidak digunakan ulang.
       */
      prisma.pesertaEvent.aggregate({
        where: {
          eventId,
        },

        _max: {
          nomorAntrian: true,
        },
      }),

      prisma.pesertaEvent.findMany({
        where: {
          ...baseWhere,
          ...createSearchFilter(q),

          status: StatusPesertaEvent.TERCATAT,
        },

        select: operasionalParticipantSelect,

        orderBy: {
          waktuTercatat: "asc",
        },

        take: 50,
      }),

      prisma.pesertaEvent.findMany({
        where: {
          ...baseWhere,

          status: StatusPesertaEvent.HADIR,
        },

        select: operasionalParticipantSelect,

        orderBy: {
          waktuCheckIn: "asc",
        },

        take: 100,
      }),

      prisma.pesertaEvent.findMany({
        where: {
          ...baseWhere,

          status: StatusPesertaEvent.MENUNGGU,
        },

        select: operasionalParticipantSelect,

        orderBy: [
          {
            nomorAntrian: "asc",
          },
          {
            waktuCheckIn: "asc",
          },
        ],

        take: 200,
      }),

      prisma.pesertaEvent.findMany({
        where: {
          ...baseWhere,

          status: StatusPesertaEvent.DIPANGGIL,
        },

        select: operasionalParticipantSelect,

        orderBy: {
          waktuDipanggil: "asc",
        },

        take: 50,
      }),

      prisma.pesertaEvent.findMany({
        where: {
          ...baseWhere,

          status: StatusPesertaEvent.SELESAI,
        },

        select: operasionalParticipantSelect,

        orderBy: {
          waktuSelesai: "desc",
        },

        take: 20,
      }),
    ]);

  const ringkasan: Record<OperasionalParticipantStatus, number> = {
    TERCATAT: 0,
    HADIR: 0,
    MENUNGGU: 0,
    DIPANGGIL: 0,
    SELESAI: 0,
    BATAL: 0,
  };

  for (const item of groupedStatus) {
    ringkasan[item.status] = item._count._all;
  }

  return {
    event: {
      id: event.id,
      nama: event.nama,
      status: event.status,

      tanggalMulai: event.tanggalMulai.toISOString(),

      tanggalSelesai: event.tanggalSelesai?.toISOString() ?? null,

      gunakanCheckIn: event.gunakanCheckIn,

      gunakanAntrean: event.gunakanAntrean,

      unitGereja: event.unitGereja,
    },

    ringkasan,

    nomorAntrianBerikutnya: (queueAggregate._max.nomorAntrian ?? 0) + 1,

    tercatat: tercatat.map(mapParticipant),

    hadir: hadir.map(mapParticipant),

    menunggu: menunggu.map(mapParticipant),

    dipanggil: dipanggil.map(mapParticipant),

    selesai: selesai.map(mapParticipant),
  };
}

async function checkInParticipant(eventId: string, pesertaId: string, nomorAntrian: number | null) {
  return runSerializable(async (tx) => {
    const event = await assertOperationalEvent(tx, eventId);

    if (event.gunakanAntrean && nomorAntrian === null) {
      throw new AppError("Nomor antrean wajib diisi.", {
        status: 422,
        code: "VALIDATION_ERROR",

        fieldErrors: {
          nomorAntrian: ["Masukkan nomor antrean peserta."],
        },
      });
    }

    if (!event.gunakanAntrean && nomorAntrian !== null) {
      throw new AppError("Event ini tidak menggunakan antrean.", {
        status: 422,
        code: "VALIDATION_ERROR",

        fieldErrors: {
          nomorAntrian: ["Nomor antrean harus dikosongkan."],
        },
      });
    }

    return changeParticipantStatus(tx, {
      eventId,
      pesertaId,

      allowedStatuses: [StatusPesertaEvent.TERCATAT],

      data: {
        status: event.gunakanAntrean ? StatusPesertaEvent.MENUNGGU : StatusPesertaEvent.HADIR,

        nomorAntrian: event.gunakanAntrean ? nomorAntrian : null,

        waktuCheckIn: new Date(),

        waktuDipanggil: null,

        waktuSelesai: null,
      },
    });
  });
}

async function callParticipant(eventId: string, pesertaId: string) {
  return runSerializable(async (tx) => {
    const event = await assertOperationalEvent(tx, eventId);

    if (!event.gunakanAntrean) {
      throw new AppError("Event ini tidak menggunakan antrean.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    return changeParticipantStatus(tx, {
      eventId,
      pesertaId,

      allowedStatuses: [StatusPesertaEvent.MENUNGGU],

      data: {
        status: StatusPesertaEvent.DIPANGGIL,

        waktuDipanggil: new Date(),
      },
    });
  });
}

async function callNextParticipant(eventId: string) {
  return runSerializable(async (tx) => {
    const event = await assertOperationalEvent(tx, eventId);

    if (!event.gunakanAntrean) {
      throw new AppError("Event ini tidak menggunakan antrean.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    const nextParticipant = await tx.pesertaEvent.findFirst({
      where: {
        eventId,
        deletedAt: null,

        status: StatusPesertaEvent.MENUNGGU,

        nomorAntrian: {
          not: null,
        },
      },

      select: {
        id: true,
      },

      orderBy: [
        {
          nomorAntrian: "asc",
        },
        {
          waktuCheckIn: "asc",
        },
      ],
    });

    if (!nextParticipant) {
      throw new AppError("Tidak ada peserta yang sedang menunggu.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    return changeParticipantStatus(tx, {
      eventId,

      pesertaId: nextParticipant.id,

      allowedStatuses: [StatusPesertaEvent.MENUNGGU],

      data: {
        status: StatusPesertaEvent.DIPANGGIL,

        waktuDipanggil: new Date(),
      },
    });
  });
}

async function returnParticipantToQueue(eventId: string, pesertaId: string) {
  return runSerializable(async (tx) => {
    const event = await assertOperationalEvent(tx, eventId);

    if (!event.gunakanAntrean) {
      throw new AppError("Event ini tidak menggunakan antrean.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    return changeParticipantStatus(tx, {
      eventId,
      pesertaId,

      allowedStatuses: [StatusPesertaEvent.DIPANGGIL],

      data: {
        status: StatusPesertaEvent.MENUNGGU,

        waktuDipanggil: null,
      },
    });
  });
}

async function completeParticipant(eventId: string, pesertaId: string) {
  return runSerializable(async (tx) => {
    const event = await assertOperationalEvent(tx, eventId);

    const requiredStatus = event.gunakanAntrean
      ? StatusPesertaEvent.DIPANGGIL
      : StatusPesertaEvent.HADIR;

    return changeParticipantStatus(tx, {
      eventId,
      pesertaId,

      allowedStatuses: [requiredStatus],

      data: {
        status: StatusPesertaEvent.SELESAI,

        waktuSelesai: new Date(),
      },
    });
  });
}

async function cancelParticipant(eventId: string, pesertaId: string) {
  return runSerializable(async (tx) => {
    await assertOperationalEvent(tx, eventId);

    return changeParticipantStatus(tx, {
      eventId,
      pesertaId,

      allowedStatuses: [
        StatusPesertaEvent.TERCATAT,
        StatusPesertaEvent.HADIR,
        StatusPesertaEvent.MENUNGGU,
        StatusPesertaEvent.DIPANGGIL,
      ],

      data: {
        status: StatusPesertaEvent.BATAL,
      },
    });
  });
}

export async function executeOperasionalEventAction(
  actor: EventActor,
  eventId: string,
  input: ExecuteOperasionalEventInput,
) {
  await getOperationalEvent(actor, eventId);

  try {
    let result: OperasionalParticipantPayload;

    switch (input.action) {
      case "CHECK_IN":
        result = await checkInParticipant(eventId, input.pesertaId, input.nomorAntrian);
        break;

      case "PANGGIL":
        result = await callParticipant(eventId, input.pesertaId);
        break;

      case "PANGGIL_BERIKUTNYA":
        result = await callNextParticipant(eventId);
        break;

      case "KEMBALIKAN":
        result = await returnParticipantToQueue(eventId, input.pesertaId);
        break;

      case "SELESAI":
        result = await completeParticipant(eventId, input.pesertaId);
        break;

      case "BATAL":
        result = await cancelParticipant(eventId, input.pesertaId);
        break;
    }

    return mapParticipant(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Nomor antrean sudah digunakan peserta lain.", {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          nomorAntrian: ["Gunakan nomor antrean lain."],
        },
      });
    }

    throw error;
  }
}
