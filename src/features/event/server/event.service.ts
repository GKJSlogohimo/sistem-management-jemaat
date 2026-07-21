import "server-only";

import { PeranPengguna, type Prisma, StatusEvent } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type { CreateEventInput, EventListItem, EventListParams, UpdateEventInput } from "../types";

type EventActor = {
  userId: string;
  peran: PeranPengguna;
  unitGerejaId: string | null;
};

const eventSelect = {
  id: true,

  unitGerejaId: true,
  kategoriEventId: true,

  nama: true,
  deskripsi: true,
  jenis: true,
  lokasi: true,

  tanggalMulai: true,
  tanggalSelesai: true,

  kapasitas: true,
  status: true,

  gunakanPencatatanPeserta: true,
  gunakanCheckIn: true,
  gunakanAntrean: true,
  izinkanNonJemaat: true,

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
      ikon: true,
      warna: true,
    },
  },

  _count: {
    select: {
      peserta: {
        where: {
          deletedAt: null,
        },
      },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

type EventPayload = Prisma.EventGetPayload<{
  select: typeof eventSelect;
}>;

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function parseJakartaDateTime(value: string) {
  return new Date(`${value}:00+07:00`);
}

function mapEvent(event: EventPayload): EventListItem {
  return {
    id: event.id,

    unitGerejaId: event.unitGerejaId,

    kategoriEventId: event.kategoriEventId,

    nama: event.nama,
    deskripsi: event.deskripsi,
    jenis: event.jenis,
    lokasi: event.lokasi,

    tanggalMulai: event.tanggalMulai.toISOString(),

    tanggalSelesai: event.tanggalSelesai?.toISOString() ?? null,

    kapasitas: event.kapasitas,
    status: event.status,

    gunakanPencatatanPeserta: event.gunakanPencatatanPeserta,

    gunakanCheckIn: event.gunakanCheckIn,

    gunakanAntrean: event.gunakanAntrean,

    izinkanNonJemaat: event.izinkanNonJemaat,

    unitGereja: event.unitGereja,

    kategoriEvent: event.kategoriEvent,

    jumlahPeserta: event._count.peserta,

    createdAt: event.createdAt.toISOString(),

    updatedAt: event.updatedAt.toISOString(),
  };
}

async function getAccessibleUnitIds(actor: EventActor): Promise<string[] | undefined> {
  if (actor.peran === PeranPengguna.SUPER_ADMIN) {
    return undefined;
  }

  if (!actor.unitGerejaId) {
    return [];
  }

  if (actor.peran !== PeranPengguna.ADMIN_INDUK) {
    return [actor.unitGerejaId];
  }

  const unit = await prisma.unitGereja.findFirst({
    where: {
      id: actor.unitGerejaId,
      deletedAt: null,
    },

    select: {
      id: true,

      subUnit: {
        where: {
          deletedAt: null,
        },

        select: {
          id: true,
        },
      },
    },
  });

  if (!unit) {
    return [];
  }

  return [unit.id, ...unit.subUnit.map((subUnit) => subUnit.id)];
}

async function assertCanAccessUnit(actor: EventActor, unitGerejaId: string) {
  const accessibleUnitIds = await getAccessibleUnitIds(actor);

  if (accessibleUnitIds && !accessibleUnitIds.includes(unitGerejaId)) {
    throw new AppError("Anda tidak memiliki akses ke Unit Gereja tersebut.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }
}

async function assertReferences(
  unitGerejaId: string,
  kategoriEventId: string,
  currentKategoriEventId?: string,
) {
  const [unit, kategori] = await Promise.all([
    prisma.unitGereja.findFirst({
      where: {
        id: unitGerejaId,
        aktif: true,
        deletedAt: null,
      },

      select: {
        id: true,
      },
    }),

    prisma.kategoriEvent.findFirst({
      where: {
        id: kategoriEventId,
        deletedAt: null,
      },

      select: {
        id: true,
        aktif: true,
      },
    }),
  ]);

  const fieldErrors: Record<string, string[]> = {};

  if (!unit) {
    fieldErrors.unitGerejaId = ["Unit Gereja tidak ditemukan atau tidak aktif."];
  }

  if (!kategori || (!kategori.aktif && kategoriEventId !== currentKategoriEventId)) {
    fieldErrors.kategoriEventId = ["Kategori Event tidak ditemukan atau tidak aktif."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Relasi Event tidak valid.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors,
    });
  }
}

function assertCreateStatus(status: StatusEvent) {
  if (status !== StatusEvent.DRAFT && status !== StatusEvent.DIBUKA) {
    throw new AppError("Event baru hanya dapat berstatus Draft atau Dibuka.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        status: ["Pilih status Draft atau Dibuka."],
      },
    });
  }
}

function assertStatusTransition(current: StatusEvent, next: StatusEvent) {
  const transitions: Record<StatusEvent, StatusEvent[]> = {
    DRAFT: [StatusEvent.DRAFT, StatusEvent.DIBUKA, StatusEvent.DIBATALKAN],

    DIBUKA: [StatusEvent.DIBUKA, StatusEvent.DITUTUP, StatusEvent.DIBATALKAN],

    DITUTUP: [StatusEvent.DITUTUP],

    DIBATALKAN: [StatusEvent.DIBATALKAN],
  };

  if (!transitions[current].includes(next)) {
    throw new AppError(`Status Event tidak dapat diubah dari ${current} menjadi ${next}.`, {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        status: ["Perubahan status Event tidak diizinkan."],
      },
    });
  }
}

function getOrderBy(
  sortBy: EventListParams["sortBy"],
  sortOrder: EventListParams["sortOrder"],
): Prisma.EventOrderByWithRelationInput {
  switch (sortBy) {
    case "nama":
      return {
        nama: sortOrder,
      };

    case "status":
      return {
        status: sortOrder,
      };

    case "jenis":
      return {
        jenis: sortOrder,
      };

    case "createdAt":
      return {
        createdAt: sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: sortOrder,
      };

    case "tanggalMulai":
    default:
      return {
        tanggalMulai: sortOrder,
      };
  }
}

export async function getEventList(actor: EventActor, params: EventListParams) {
  const accessibleUnitIds = await getAccessibleUnitIds(actor);

  const { q, page, pageSize, unitGerejaId, kategoriEventId, jenis, status, sortBy, sortOrder } =
    params;

  const where: Prisma.EventWhereInput = {
    deletedAt: null,

    ...(accessibleUnitIds
      ? {
          unitGerejaId: {
            in: accessibleUnitIds,
          },
        }
      : {}),

    ...(unitGerejaId
      ? {
          unitGerejaId,
        }
      : {}),

    ...(kategoriEventId
      ? {
          kategoriEventId,
        }
      : {}),

    ...(jenis
      ? {
          jenis,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(q
      ? {
          OR: [
            {
              nama: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              deskripsi: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              lokasi: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              unitGereja: {
                is: {
                  nama: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              kategoriEvent: {
                is: {
                  nama: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      select: eventSelect,

      orderBy: getOrderBy(sortBy, sortOrder),

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    prisma.event.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapEvent),

    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getEventById(actor: EventActor, id: string) {
  const event = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: eventSelect,
  });

  if (!event) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, event.unitGerejaId);

  return mapEvent(event);
}

export async function createEvent(actor: EventActor, input: CreateEventInput) {
  await assertCanAccessUnit(actor, input.unitGerejaId);

  await assertReferences(input.unitGerejaId, input.kategoriEventId);

  assertCreateStatus(input.status);

  const event = await prisma.event.create({
    data: {
      unitGerejaId: input.unitGerejaId,

      kategoriEventId: input.kategoriEventId,

      nama: input.nama.trim(),

      deskripsi: normalizeOptionalText(input.deskripsi),

      jenis: input.jenis,

      lokasi: normalizeOptionalText(input.lokasi),

      tanggalMulai: parseJakartaDateTime(input.tanggalMulai),

      tanggalSelesai: input.tanggalSelesai ? parseJakartaDateTime(input.tanggalSelesai) : null,

      kapasitas: input.kapasitas,

      status: input.status,

      gunakanPencatatanPeserta: input.gunakanPencatatanPeserta,

      gunakanCheckIn: input.gunakanCheckIn,

      gunakanAntrean: input.gunakanAntrean,

      izinkanNonJemaat: input.izinkanNonJemaat,
    },

    select: eventSelect,
  });

  return mapEvent(event);
}

export async function updateEvent(actor: EventActor, id: string, input: UpdateEventInput) {
  const current = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      kategoriEventId: true,
      status: true,

      _count: {
        select: {
          peserta: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  if (!current) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  await assertCanAccessUnit(actor, input.unitGerejaId);

  await assertReferences(input.unitGerejaId, input.kategoriEventId, current.kategoriEventId);

  assertStatusTransition(current.status, input.status);

  const participantCount = current._count.peserta;

  if (participantCount > 0 && current.unitGerejaId !== input.unitGerejaId) {
    throw new AppError(
      "Event yang sudah mempunyai peserta tidak dapat dipindahkan ke Unit Gereja lain.",
      {
        status: 409,
        code: "CONFLICT",
        fieldErrors: {
          unitGerejaId: ["Event sudah mempunyai peserta."],
        },
      },
    );
  }

  if (participantCount > 0 && current.kategoriEventId !== input.kategoriEventId) {
    throw new AppError("Kategori Event tidak dapat diubah setelah peserta tercatat.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        kategoriEventId: ["Event sudah mempunyai peserta."],
      },
    });
  }

  if (input.kapasitas !== null && input.kapasitas < participantCount) {
    throw new AppError(
      "Kapasitas tidak boleh lebih kecil daripada jumlah peserta yang sudah tercatat.",
      {
        status: 422,
        code: "VALIDATION_ERROR",
        fieldErrors: {
          kapasitas: [`Minimal kapasitas adalah ${participantCount}.`],
        },
      },
    );
  }

  if (participantCount > 0 && !input.gunakanPencatatanPeserta) {
    throw new AppError(
      "Pencatatan peserta tidak dapat dinonaktifkan karena Event sudah mempunyai peserta.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  const event = await prisma.event.update({
    where: {
      id,
    },

    data: {
      unitGerejaId: input.unitGerejaId,

      kategoriEventId: input.kategoriEventId,

      nama: input.nama.trim(),

      deskripsi: normalizeOptionalText(input.deskripsi),

      jenis: input.jenis,

      lokasi: normalizeOptionalText(input.lokasi),

      tanggalMulai: parseJakartaDateTime(input.tanggalMulai),

      tanggalSelesai: input.tanggalSelesai ? parseJakartaDateTime(input.tanggalSelesai) : null,

      kapasitas: input.kapasitas,

      status: input.status,

      gunakanPencatatanPeserta: input.gunakanPencatatanPeserta,

      gunakanCheckIn: input.gunakanCheckIn,

      gunakanAntrean: input.gunakanAntrean,

      izinkanNonJemaat: input.izinkanNonJemaat,
    },

    select: eventSelect,
  });

  return mapEvent(event);
}

export async function deleteEvent(actor: EventActor, id: string) {
  const event = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,

      _count: {
        select: {
          peserta: true,
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

  if (event._count.peserta > 0) {
    throw new AppError(
      "Event tidak dapat dihapus karena sudah mempunyai peserta. Ubah status menjadi Ditutup atau Dibatalkan.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  await prisma.event.update({
    where: {
      id,
    },

    data: {
      deletedAt: new Date(),
    },
  });

  return {
    id,
  };
}
