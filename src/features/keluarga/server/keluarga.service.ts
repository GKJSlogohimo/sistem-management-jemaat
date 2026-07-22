import "server-only";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import { canReadNomorKK } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
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

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeNomorKK(value: string) {
  return value.trim();
}

function mapKeluarga(keluarga: KeluargaPayload, allowNomorKK: boolean): KeluargaListItem {
  return {
    id: keluarga.id,

    unitGerejaId: keluarga.unitGerejaId,

    /*
     * Nomor KK tidak dikirim ke browser
     * untuk role yang tidak berizin.
     */
    nomorKK: allowNomorKK ? keluarga.nomorKK : null,

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

async function createUnitScope(
  actor: AppActor,
  requestedUnitId?: string | null,
): Promise<Prisma.KeluargaWhereInput> {
  if (requestedUnitId) {
    await assertCanAccessUnit(actor, requestedUnitId);

    return {
      unitGerejaId: requestedUnitId,
    };
  }

  const accessibleUnitIds = await getAccessibleUnitIds(actor);

  return {
    unitGerejaId: {
      in: accessibleUnitIds,
    },
  };
}

function getOrderBy(
  sortBy: KeluargaListParams["sortBy"],
  sortOrder: KeluargaListParams["sortOrder"],
  allowNomorKK: boolean,
): Prisma.KeluargaOrderByWithRelationInput {
  switch (sortBy) {
    case "nomorKK":
      /*
       * Role tanpa izin tidak boleh
       * mengurutkan berdasarkan nomor KK.
       */
      if (!allowNomorKK) {
        return {
          namaKepalaKeluarga: sortOrder,
        };
      }

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

function throwNomorKKConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new AppError("Nomor KK sudah terdaftar.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        nomorKK: ["Nomor KK sudah terdaftar."],
      },
    });
  }

  throw error;
}

export async function getKeluargaList(actor: AppActor, params: KeluargaListParams) {
  const allowNomorKK = canReadNomorKK(actor.peran);

  const { q, page, pageSize, unitGerejaId, sortBy, sortOrder } = params;

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const searchConditions: Prisma.KeluargaWhereInput[] = [];

  if (q) {
    searchConditions.push(
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
          is: {
            kode: {
              contains: q,
              mode: "insensitive",
            },
          },
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
    );

    /*
     * Role tanpa izin tidak dapat
     * menguji keberadaan nomor KK
     * melalui kolom pencarian.
     */
    if (allowNomorKK) {
      searchConditions.push({
        nomorKK: {
          contains: q,
        },
      });
    }
  }

  const where: Prisma.KeluargaWhereInput = {
    deletedAt: null,

    ...unitScope,

    ...(q
      ? {
          OR: searchConditions,
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.keluarga.findMany({
      where,

      select: keluargaSelect,

      orderBy: getOrderBy(sortBy, sortOrder, allowNomorKK),

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    prisma.keluarga.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map((keluarga) => mapKeluarga(keluarga, allowNomorKK)),

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

export async function getKeluargaById(actor: AppActor, id: string) {
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

  await assertCanAccessUnit(actor, keluarga.unitGerejaId);

  return mapKeluarga(keluarga, canReadNomorKK(actor.peran));
}

export async function createKeluarga(actor: AppActor, input: CreateKeluargaInput) {
  await assertCanAccessUnit(actor, input.unitGerejaId);

  await assertUnitGerejaAvailable(input.unitGerejaId);

  const nomorKK = normalizeNomorKK(input.nomorKK);

  const existing = await prisma.keluarga.findUnique({
    where: {
      nomorKK,
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

  try {
    /*
     * Nomor KK menggunakan unique
     * constraint. Record soft-delete
     * dengan nomor yang sama dipulihkan.
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

      return mapKeluarga(restored, canReadNomorKK(actor.peran));
    }

    const keluarga = await prisma.keluarga.create({
      data: {
        unitGerejaId: input.unitGerejaId,

        nomorKK,

        namaKepalaKeluarga: input.namaKepalaKeluarga.trim(),

        alamat: normalizeOptionalText(input.alamat),

        noHp: normalizeOptionalText(input.noHp),
      },

      select: keluargaSelect,
    });

    return mapKeluarga(keluarga, canReadNomorKK(actor.peran));
  } catch (error) {
    throwNomorKKConflict(error);
  }
}

export async function updateKeluarga(actor: AppActor, id: string, input: UpdateKeluargaInput) {
  const current = await prisma.keluarga.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      nomorKK: true,
    },
  });

  if (!current) {
    throw new AppError("Data keluarga tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  /*
   * Actor harus memiliki akses
   * ke unit lama dan unit tujuan.
   */
  await assertCanAccessUnit(actor, current.unitGerejaId);

  await assertCanAccessUnit(actor, input.unitGerejaId);

  await assertUnitGerejaAvailable(input.unitGerejaId);

  if (current.unitGerejaId !== input.unitGerejaId) {
    /*
     * Anggota soft-delete tetap dihitung
     * karena relasi historis masih
     * menunjuk keluarga tersebut.
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

  const allowNomorKK = canReadNomorKK(actor.peran);

  /*
   * Role tanpa izin membaca nomor KK
   * tidak boleh mengubahnya melalui
   * request API manual.
   */
  const nomorKK = allowNomorKK
    ? normalizeNomorKK(input.nomorKK ?? current.nomorKK)
    : current.nomorKK;

  if (nomorKK !== current.nomorKK) {
    const duplicate = await prisma.keluarga.findUnique({
      where: {
        nomorKK,
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
  }

  try {
    const keluarga = await prisma.keluarga.update({
      where: {
        id,
      },

      data: {
        unitGerejaId: input.unitGerejaId,

        nomorKK,

        namaKepalaKeluarga: input.namaKepalaKeluarga.trim(),

        alamat: normalizeOptionalText(input.alamat),

        noHp: normalizeOptionalText(input.noHp),
      },

      select: keluargaSelect,
    });

    return mapKeluarga(keluarga, allowNomorKK);
  } catch (error) {
    throwNomorKKConflict(error);
  }
}

export async function deleteKeluarga(actor: AppActor, id: string) {
  const keluarga = await prisma.keluarga.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      namaKepalaKeluarga: true,
      unitGerejaId: true,
    },
  });

  if (!keluarga) {
    throw new AppError("Data keluarga tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, keluarga.unitGerejaId);

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

export async function getKeluargaOptions(actor: AppActor, unitGerejaId?: string) {
  const allowNomorKK = canReadNomorKK(actor.peran);

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const data = await prisma.keluarga.findMany({
    where: {
      deletedAt: null,
      ...unitScope,
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

  return data.map((keluarga) => ({
    id: keluarga.id,

    unitGerejaId: keluarga.unitGerejaId,

    nomorKK: allowNomorKK ? keluarga.nomorKK : null,

    namaKepalaKeluarga: keluarga.namaKepalaKeluarga,
  }));
}
