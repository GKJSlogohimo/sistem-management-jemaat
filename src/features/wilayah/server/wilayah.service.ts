import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  CreateWilayahInput,
  UpdateWilayahInput,
  WilayahListItem,
  WilayahListParams,
} from "../types";

const wilayahSelect = {
  id: true,
  unitGerejaId: true,
  nama: true,
  keterangan: true,

  unitGereja: {
    select: {
      id: true,
      kode: true,
      nama: true,
      jenis: true,
    },
  },

  _count: {
    select: {
      jemaat: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WilayahSelect;

type WilayahPayload = Prisma.WilayahGetPayload<{
  select: typeof wilayahSelect;
}>;

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function mapWilayah(wilayah: WilayahPayload): WilayahListItem {
  return {
    id: wilayah.id,
    unitGerejaId: wilayah.unitGerejaId,
    nama: wilayah.nama,
    keterangan: wilayah.keterangan,
    unitGereja: wilayah.unitGereja,
    jumlahJemaat: wilayah._count.jemaat,
    createdAt: wilayah.createdAt.toISOString(),
    updatedAt: wilayah.updatedAt.toISOString(),
  };
}

async function assertUnitGerejaAvailable(unitGerejaId: string) {
  const unit = await prisma.unitGereja.findFirst({
    where: {
      id: unitGerejaId,
      aktif: true,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!unit) {
    throw new AppError("Unit gereja tidak ditemukan atau tidak aktif.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        unitGerejaId: ["Pilih unit gereja yang masih aktif."],
      },
    });
  }
}

async function findWilayahWithSameName(unitGerejaId: string, nama: string, excludedId?: string) {
  return prisma.wilayah.findFirst({
    where: {
      unitGerejaId,

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
      deletedAt: true,
    },
  });
}

function getOrderBy(
  sortBy: WilayahListParams["sortBy"],
  sortOrder: WilayahListParams["sortOrder"],
): Prisma.WilayahOrderByWithRelationInput {
  switch (sortBy) {
    case "unitGereja":
      return {
        unitGereja: {
          nama: sortOrder,
        },
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

export async function getWilayahList(params: WilayahListParams) {
  const { q, page, pageSize, unitGerejaId, sortBy, sortOrder } = params;

  const where: Prisma.WilayahWhereInput = {
    deletedAt: null,

    ...(unitGerejaId
      ? {
          unitGerejaId,
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
              keterangan: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              unitGereja: {
                nama: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              unitGereja: {
                kode: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.wilayah.findMany({
      where,
      select: wilayahSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.wilayah.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapWilayah),

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

export async function getWilayahById(id: string) {
  const wilayah = await prisma.wilayah.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: wilayahSelect,
  });

  if (!wilayah) {
    throw new AppError("Wilayah tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapWilayah(wilayah);
}

export async function createWilayah(input: CreateWilayahInput) {
  const nama = input.nama.trim();

  await assertUnitGerejaAvailable(input.unitGerejaId);

  const existing = await findWilayahWithSameName(input.unitGerejaId, nama);

  if (existing && !existing.deletedAt) {
    throw new AppError("Nama wilayah sudah digunakan pada unit gereja tersebut.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        nama: ["Nama wilayah sudah digunakan pada unit gereja tersebut."],
      },
    });
  }

  /*
   * Karena schema memakai unique [unitGerejaId, nama],
   * data soft delete dengan nama yang sama dipulihkan,
   * bukan membuat record baru.
   */
  if (existing?.deletedAt) {
    const restored = await prisma.wilayah.update({
      where: {
        id: existing.id,
      },

      data: {
        nama,
        keterangan: normalizeOptionalText(input.keterangan),
        deletedAt: null,
      },

      select: wilayahSelect,
    });

    return mapWilayah(restored);
  }

  const wilayah = await prisma.wilayah.create({
    data: {
      unitGerejaId: input.unitGerejaId,
      nama,
      keterangan: normalizeOptionalText(input.keterangan),
    },

    select: wilayahSelect,
  });

  return mapWilayah(wilayah);
}

export async function updateWilayah(id: string, input: UpdateWilayahInput) {
  const current = await prisma.wilayah.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
    },
  });

  if (!current) {
    throw new AppError("Wilayah tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertUnitGerejaAvailable(input.unitGerejaId);

  if (current.unitGerejaId !== input.unitGerejaId) {
    const jemaatCount = await prisma.jemaat.count({
      where: {
        wilayahId: id,
      },
    });

    if (jemaatCount > 0) {
      throw new AppError(
        "Wilayah yang sudah mempunyai jemaat tidak dapat dipindahkan ke unit gereja lain.",
        {
          status: 409,
          code: "CONFLICT",
          fieldErrors: {
            unitGerejaId: ["Wilayah masih mempunyai data jemaat."],
          },
        },
      );
    }
  }

  const nama = input.nama.trim();

  const duplicate = await findWilayahWithSameName(input.unitGerejaId, nama, id);

  if (duplicate) {
    throw new AppError("Nama wilayah sudah digunakan pada unit gereja tersebut.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        nama: ["Nama wilayah sudah digunakan pada unit gereja tersebut."],
      },
    });
  }

  const wilayah = await prisma.wilayah.update({
    where: {
      id,
    },

    data: {
      unitGerejaId: input.unitGerejaId,
      nama,
      keterangan: normalizeOptionalText(input.keterangan),
    },

    select: wilayahSelect,
  });

  return mapWilayah(wilayah);
}

export async function deleteWilayah(id: string) {
  const wilayah = await prisma.wilayah.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      nama: true,
    },
  });

  if (!wilayah) {
    throw new AppError("Wilayah tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  /*
   * Hitung seluruh jemaat, termasuk yang soft deleted,
   * karena data historis masih menunjuk ke wilayah ini.
   */
  const jemaatCount = await prisma.jemaat.count({
    where: {
      wilayahId: id,
    },
  });

  if (jemaatCount > 0) {
    throw new AppError("Wilayah tidak dapat dihapus karena masih mempunyai data jemaat.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await prisma.wilayah.update({
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
