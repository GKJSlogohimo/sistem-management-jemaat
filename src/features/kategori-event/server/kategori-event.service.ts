import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  CreateKategoriEventInput,
  KategoriEventListItem,
  KategoriEventListParams,
  UpdateKategoriEventInput,
} from "../types";

const kategoriEventSelect = {
  id: true,
  nama: true,
  ikon: true,
  warna: true,
  deskripsi: true,
  aktif: true,

  _count: {
    select: {
      events: {
        where: {
          deletedAt: null,
        },
      },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.KategoriEventSelect;

type KategoriEventPayload = Prisma.KategoriEventGetPayload<{
  select: typeof kategoriEventSelect;
}>;

function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized ? normalized : null;
}

function mapKategoriEvent(kategori: KategoriEventPayload): KategoriEventListItem {
  return {
    id: kategori.id,
    nama: kategori.nama,
    ikon: kategori.ikon,
    warna: kategori.warna,
    deskripsi: kategori.deskripsi,
    aktif: kategori.aktif,
    jumlahEvent: kategori._count.events,
    createdAt: kategori.createdAt.toISOString(),
    updatedAt: kategori.updatedAt.toISOString(),
  };
}

async function findKategoriWithSameName(nama: string, excludedId?: string) {
  return prisma.kategoriEvent.findFirst({
    where: {
      nama: {
        equals: nama,
        mode: "insensitive",
      },

      ...(excludedId
        ? {
            id: {
              not: excludedId,
            },
          }
        : {}),
    },

    select: {
      id: true,
      nama: true,
      deletedAt: true,
    },
  });
}

function getOrderBy(
  sortBy: KategoriEventListParams["sortBy"],
  sortOrder: KategoriEventListParams["sortOrder"],
): Prisma.KategoriEventOrderByWithRelationInput {
  switch (sortBy) {
    case "aktif":
      return {
        aktif: sortOrder,
      };

    case "createdAt":
      return {
        createdAt: sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: sortOrder,
      };

    case "nama":
    default:
      return {
        nama: sortOrder,
      };
  }
}

export async function getKategoriEventList(params: KategoriEventListParams) {
  const { q, page, pageSize, aktif, sortBy, sortOrder } = params;

  const where: Prisma.KategoriEventWhereInput = {
    deletedAt: null,

    ...(aktif !== undefined
      ? {
          aktif,
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
              ikon: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.kategoriEvent.findMany({
      where,
      select: kategoriEventSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.kategoriEvent.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapKategoriEvent),

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

export async function getKategoriEventById(id: string) {
  const kategori = await prisma.kategoriEvent.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: kategoriEventSelect,
  });

  if (!kategori) {
    throw new AppError("Kategori Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapKategoriEvent(kategori);
}

export async function createKategoriEvent(input: CreateKategoriEventInput) {
  const nama = input.nama.trim();

  const existing = await findKategoriWithSameName(nama);

  if (existing && !existing.deletedAt) {
    throw new AppError("Nama Kategori Event sudah digunakan.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        nama: ["Nama Kategori Event sudah digunakan."],
      },
    });
  }

  /*
   * Nama memakai unique constraint.
   * Ketika kategori lama sudah soft delete,
   * pulihkan record tersebut.
   */
  if (existing?.deletedAt) {
    const restored = await prisma.kategoriEvent.update({
      where: {
        id: existing.id,
      },

      data: {
        nama,
        ikon: input.ikon,
        warna: normalizeOptionalText(input.warna),
        deskripsi: normalizeOptionalText(input.deskripsi),
        aktif: input.aktif,
        deletedAt: null,
      },

      select: kategoriEventSelect,
    });

    return mapKategoriEvent(restored);
  }

  const kategori = await prisma.kategoriEvent.create({
    data: {
      nama,
      ikon: input.ikon,
      warna: normalizeOptionalText(input.warna),
      deskripsi: normalizeOptionalText(input.deskripsi),
      aktif: input.aktif,
    },

    select: kategoriEventSelect,
  });

  return mapKategoriEvent(kategori);
}

export async function updateKategoriEvent(id: string, input: UpdateKategoriEventInput) {
  const current = await prisma.kategoriEvent.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  if (!current) {
    throw new AppError("Kategori Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const nama = input.nama.trim();

  const duplicate = await findKategoriWithSameName(nama, id);

  if (duplicate) {
    throw new AppError("Nama Kategori Event sudah digunakan.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        nama: ["Nama Kategori Event sudah digunakan."],
      },
    });
  }

  const kategori = await prisma.kategoriEvent.update({
    where: {
      id,
    },

    data: {
      nama,
      ikon: input.ikon,
      warna: normalizeOptionalText(input.warna),
      deskripsi: normalizeOptionalText(input.deskripsi),
      aktif: input.aktif,
    },

    select: kategoriEventSelect,
  });

  return mapKategoriEvent(kategori);
}

export async function deleteKategoriEvent(id: string) {
  const kategori = await prisma.kategoriEvent.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      nama: true,
    },
  });

  if (!kategori) {
    throw new AppError("Kategori Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  /*
   * Hitung semua Event, termasuk Event yang
   * sudah soft delete. Relasi historis tetap
   * menunjuk kategori ini.
   */
  const eventCount = await prisma.event.count({
    where: {
      kategoriEventId: id,
    },
  });

  if (eventCount > 0) {
    throw new AppError(
      "Kategori Event tidak dapat dihapus karena sudah digunakan. Nonaktifkan kategori sebagai gantinya.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  await prisma.kategoriEvent.update({
    where: {
      id,
    },

    data: {
      aktif: false,
      deletedAt: new Date(),
    },
  });

  return {
    id,
  };
}

export async function getActiveKategoriEventOptions() {
  return prisma.kategoriEvent.findMany({
    where: {
      aktif: true,
      deletedAt: null,
    },

    select: {
      id: true,
      nama: true,
      ikon: true,
      warna: true,
    },

    orderBy: {
      nama: "asc",
    },
  });
}
