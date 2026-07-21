import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  CreateKeluargaInput,
  KeluargaListItem,
  KeluargaListParams,
  UpdateKeluargaInput,
} from "../types";

const keluargaSelect = {
  id: true,
  unitGerejaId: true,
  nomorKK: true,
  namaKepalaKeluarga: true,
  alamat: true,
  noHp: true,

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
      jemaat: {
        where: {
          deletedAt: null,
        },
      },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.KeluargaSelect;

type KeluargaPayload = Prisma.KeluargaGetPayload<{
  select: typeof keluargaSelect;
}>;

function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function mapKeluarga(keluarga: KeluargaPayload): KeluargaListItem {
  return {
    id: keluarga.id,
    unitGerejaId: keluarga.unitGerejaId,
    nomorKK: keluarga.nomorKK,
    namaKepalaKeluarga: keluarga.namaKepalaKeluarga,
    alamat: keluarga.alamat,
    noHp: keluarga.noHp,
    unitGereja: keluarga.unitGereja,
    jumlahAnggota: keluarga._count.jemaat,
    createdAt: keluarga.createdAt.toISOString(),
    updatedAt: keluarga.updatedAt.toISOString(),
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

function getOrderBy(
  sortBy: KeluargaListParams["sortBy"],
  sortOrder: KeluargaListParams["sortOrder"],
): Prisma.KeluargaOrderByWithRelationInput {
  switch (sortBy) {
    case "nomorKK":
      return {
        nomorKK: sortOrder,
      };

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

    case "namaKepalaKeluarga":
    default:
      return {
        namaKepalaKeluarga: sortOrder,
      };
  }
}

export async function getKeluargaList(params: KeluargaListParams) {
  const { q, page, pageSize, unitGerejaId, sortBy, sortOrder } = params;

  const where: Prisma.KeluargaWhereInput = {
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
              nomorKK: {
                contains: q,
              },
            },
            {
              namaKepalaKeluarga: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              alamat: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              noHp: {
                contains: q,
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
            {
              unitGereja: {
                nama: {
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
    prisma.keluarga.findMany({
      where,
      select: keluargaSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.keluarga.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapKeluarga),

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

export async function getKeluargaById(id: string) {
  const keluarga = await prisma.keluarga.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: keluargaSelect,
  });

  if (!keluarga) {
    throw new AppError("Data keluarga tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapKeluarga(keluarga);
}

export async function createKeluarga(input: CreateKeluargaInput) {
  await assertUnitGerejaAvailable(input.unitGerejaId);

  const existing = await prisma.keluarga.findUnique({
    where: {
      nomorKK: input.nomorKK,
    },

    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (existing && !existing.deletedAt) {
    throw new AppError("Nomor KK sudah terdaftar.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        nomorKK: ["Nomor KK sudah terdaftar."],
      },
    });
  }

  /*
   * nomorKK memakai unique constraint.
   * Jika record lama sudah soft delete,
   * pulihkan record tersebut.
   */
  if (existing?.deletedAt) {
    const restored = await prisma.keluarga.update({
      where: {
        id: existing.id,
      },

      data: {
        unitGerejaId: input.unitGerejaId,
        namaKepalaKeluarga: input.namaKepalaKeluarga.trim(),
        alamat: normalizeOptionalText(input.alamat),
        noHp: normalizeOptionalText(input.noHp),
        deletedAt: null,
      },

      select: keluargaSelect,
    });

    return mapKeluarga(restored);
  }

  const keluarga = await prisma.keluarga.create({
    data: {
      unitGerejaId: input.unitGerejaId,
      nomorKK: input.nomorKK,
      namaKepalaKeluarga: input.namaKepalaKeluarga.trim(),
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
    },

    select: keluargaSelect,
  });

  return mapKeluarga(keluarga);
}

export async function updateKeluarga(id: string, input: UpdateKeluargaInput) {
  const current = await prisma.keluarga.findFirst({
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
    throw new AppError("Data keluarga tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertUnitGerejaAvailable(input.unitGerejaId);

  if (current.unitGerejaId !== input.unitGerejaId) {
    /*
     * Hitung semua anggota, termasuk record
     * yang sudah soft delete, karena relasi
     * historis tetap menunjuk keluarga ini.
     */
    const memberCount = await prisma.jemaat.count({
      where: {
        keluargaId: id,
      },
    });

    if (memberCount > 0) {
      throw new AppError(
        "Keluarga yang sudah mempunyai anggota jemaat tidak dapat dipindahkan ke unit gereja lain.",
        {
          status: 409,
          code: "CONFLICT",
          fieldErrors: {
            unitGerejaId: ["Keluarga masih mempunyai data anggota jemaat."],
          },
        },
      );
    }
  }

  const duplicate = await prisma.keluarga.findUnique({
    where: {
      nomorKK: input.nomorKK,
    },

    select: {
      id: true,
    },
  });

  if (duplicate && duplicate.id !== id) {
    throw new AppError("Nomor KK sudah terdaftar.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        nomorKK: ["Nomor KK sudah terdaftar."],
      },
    });
  }

  const keluarga = await prisma.keluarga.update({
    where: {
      id,
    },

    data: {
      unitGerejaId: input.unitGerejaId,
      nomorKK: input.nomorKK,
      namaKepalaKeluarga: input.namaKepalaKeluarga.trim(),
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
    },

    select: keluargaSelect,
  });

  return mapKeluarga(keluarga);
}

export async function deleteKeluarga(id: string) {
  const keluarga = await prisma.keluarga.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      namaKepalaKeluarga: true,
    },
  });

  if (!keluarga) {
    throw new AppError("Data keluarga tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const memberCount = await prisma.jemaat.count({
    where: {
      keluargaId: id,
    },
  });

  if (memberCount > 0) {
    throw new AppError("Keluarga tidak dapat dihapus karena masih mempunyai anggota jemaat.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await prisma.keluarga.update({
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

export async function getKeluargaOptions(unitGerejaId?: string) {
  return prisma.keluarga.findMany({
    where: {
      deletedAt: null,

      ...(unitGerejaId
        ? {
            unitGerejaId,
          }
        : {}),
    },

    select: {
      id: true,
      unitGerejaId: true,
      nomorKK: true,
      namaKepalaKeluarga: true,
    },

    orderBy: {
      namaKepalaKeluarga: "asc",
    },
  });
}
