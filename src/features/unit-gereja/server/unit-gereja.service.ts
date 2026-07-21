import "server-only";

import { JenisUnitGereja, Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  CreateUnitGerejaInput,
  UnitGerejaListItem,
  UnitGerejaListParams,
  UpdateUnitGerejaInput,
} from "../types";

const MAX_SUB_INDUK = 3;

const unitGerejaSelect = {
  id: true,
  kode: true,
  nama: true,
  jenis: true,
  alamat: true,
  noHp: true,
  email: true,
  penanggungJawab: true,
  aktif: true,
  parentId: true,
  parent: {
    select: {
      id: true,
      kode: true,
      nama: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitGerejaSelect;

type UnitGerejaPayload = Prisma.UnitGerejaGetPayload<{
  select: typeof unitGerejaSelect;
}>;

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function mapUnitGereja(unit: UnitGerejaPayload): UnitGerejaListItem {
  return {
    ...unit,
    createdAt: unit.createdAt.toISOString(),
    updatedAt: unit.updatedAt.toISOString(),
  };
}

async function assertUniqueCode(code: string, excludedId?: string) {
  const existing = await prisma.unitGereja.findFirst({
    where: {
      kode: code.toUpperCase(),
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
    },
  });

  if (existing) {
    throw new AppError("Kode unit gereja sudah digunakan.", {
      status: 409,
      code: "CONFLICT",
    });
  }
}

async function assertValidParent(parentId: string | null) {
  if (!parentId) {
    throw new AppError("Subinduk wajib mempunyai unit gereja induk.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        parentId: ["Subinduk wajib mempunyai unit gereja induk."],
      },
    });
  }

  const parent = await prisma.unitGereja.findFirst({
    where: {
      id: parentId,
      jenis: JenisUnitGereja.INDUK,
      aktif: true,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!parent) {
    throw new AppError("Unit gereja induk tidak ditemukan atau tidak aktif.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        parentId: ["Pilih unit gereja induk yang masih aktif."],
      },
    });
  }
}

async function assertUnitStructure(input: CreateUnitGerejaInput, excludedId?: string) {
  if (input.jenis === JenisUnitGereja.INDUK) {
    const existingInduk = await prisma.unitGereja.count({
      where: {
        jenis: JenisUnitGereja.INDUK,
        deletedAt: null,
        ...(excludedId
          ? {
              id: {
                not: excludedId,
              },
            }
          : {}),
      },
    });

    if (existingInduk > 0) {
      throw new AppError("Sistem hanya dapat memiliki satu unit gereja induk.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    return;
  }

  await assertValidParent(input.parentId);

  const subIndukCount = await prisma.unitGereja.count({
    where: {
      jenis: JenisUnitGereja.SUB_INDUK,
      deletedAt: null,
      ...(excludedId
        ? {
            id: {
              not: excludedId,
            },
          }
        : {}),
    },
  });

  if (subIndukCount >= MAX_SUB_INDUK) {
    throw new AppError(`Jumlah subinduk maksimal ${MAX_SUB_INDUK}.`, {
      status: 409,
      code: "CONFLICT",
    });
  }
}

function getOrderBy(
  sortBy: UnitGerejaListParams["sortBy"],
  sortOrder: UnitGerejaListParams["sortOrder"],
): Prisma.UnitGerejaOrderByWithRelationInput {
  switch (sortBy) {
    case "kode":
      return {
        kode: sortOrder,
      };

    case "jenis":
      return {
        jenis: sortOrder,
      };

    case "aktif":
      return {
        aktif: sortOrder,
      };

    case "createdAt":
      return {
        createdAt: sortOrder,
      };

    case "nama":
    default:
      return {
        nama: sortOrder,
      };
  }
}

export async function getUnitGerejaList(params: UnitGerejaListParams) {
  const { q, page, pageSize, sortBy, sortOrder } = params;

  const where: Prisma.UnitGerejaWhereInput = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            {
              kode: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              nama: {
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
              penanggungJawab: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.unitGereja.findMany({
      where,
      select: unitGerejaSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.unitGereja.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapUnitGereja),

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

export async function getUnitGerejaById(id: string) {
  const unit = await prisma.unitGereja.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: unitGerejaSelect,
  });

  if (!unit) {
    throw new AppError("Unit gereja tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapUnitGereja(unit);
}

export async function getUnitGerejaIndukOptions() {
  return prisma.unitGereja.findMany({
    where: {
      jenis: JenisUnitGereja.INDUK,
      aktif: true,
      deletedAt: null,
    },
    select: {
      id: true,
      kode: true,
      nama: true,
    },
    orderBy: {
      nama: "asc",
    },
  });
}

export async function createUnitGereja(input: CreateUnitGerejaInput) {
  const kode = input.kode.trim().toUpperCase();

  await assertUniqueCode(kode);
  await assertUnitStructure(input);

  const unit = await prisma.unitGereja.create({
    data: {
      kode,
      nama: input.nama.trim(),
      jenis: input.jenis,
      parentId: input.jenis === JenisUnitGereja.INDUK ? null : input.parentId,
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
      email: normalizeOptionalText(input.email),
      penanggungJawab: normalizeOptionalText(input.penanggungJawab),
      aktif: input.aktif,
    },
    select: unitGerejaSelect,
  });

  return mapUnitGereja(unit);
}

export async function updateUnitGereja(id: string, input: UpdateUnitGerejaInput) {
  const current = await prisma.unitGereja.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      jenis: true,
    },
  });

  if (!current) {
    throw new AppError("Unit gereja tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (input.jenis === JenisUnitGereja.SUB_INDUK && input.parentId === id) {
    throw new AppError("Unit gereja tidak dapat menjadi parent bagi dirinya sendiri.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        parentId: ["Unit gereja tidak dapat menjadi parent bagi dirinya sendiri."],
      },
    });
  }

  if (current.jenis === JenisUnitGereja.INDUK && input.jenis === JenisUnitGereja.SUB_INDUK) {
    const childCount = await prisma.unitGereja.count({
      where: {
        parentId: id,
        deletedAt: null,
      },
    });

    if (childCount > 0) {
      throw new AppError(
        "Unit induk yang masih memiliki subinduk tidak dapat diubah menjadi subinduk.",
        {
          status: 409,
          code: "CONFLICT",
        },
      );
    }
  }

  if (current.jenis === JenisUnitGereja.INDUK && !input.aktif) {
    const activeChildCount = await prisma.unitGereja.count({
      where: {
        parentId: id,
        aktif: true,
        deletedAt: null,
      },
    });

    if (activeChildCount > 0) {
      throw new AppError("Nonaktifkan seluruh subinduk terlebih dahulu.", {
        status: 409,
        code: "CONFLICT",
      });
    }
  }

  const kode = input.kode.trim().toUpperCase();

  await assertUniqueCode(kode, id);
  await assertUnitStructure(input, id);

  const unit = await prisma.unitGereja.update({
    where: {
      id,
    },
    data: {
      kode,
      nama: input.nama.trim(),
      jenis: input.jenis,
      parentId: input.jenis === JenisUnitGereja.INDUK ? null : input.parentId,
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
      email: normalizeOptionalText(input.email),
      penanggungJawab: normalizeOptionalText(input.penanggungJawab),
      aktif: input.aktif,
    },
    select: unitGerejaSelect,
  });

  return mapUnitGereja(unit);
}

export async function deleteUnitGereja(id: string) {
  const unit = await prisma.unitGereja.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      nama: true,
    },
  });

  if (!unit) {
    throw new AppError("Unit gereja tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const [
    subUnitCount,
    wilayahCount,
    keluargaCount,
    jemaatCount,
    eventCount,
    profileCount,
    baptisanCount,
    pernikahanCount,
    kematianCount,
  ] = await prisma.$transaction([
    prisma.unitGereja.count({
      where: {
        parentId: id,
        deletedAt: null,
      },
    }),

    prisma.wilayah.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.keluarga.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.jemaat.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.event.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.profilPengguna.count({
      where: {
        unitGerejaId: id,
      },
    }),

    prisma.baptisan.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.pernikahan.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),

    prisma.kematian.count({
      where: {
        unitGerejaId: id,
        deletedAt: null,
      },
    }),
  ]);

  const relationCount =
    subUnitCount +
    wilayahCount +
    keluargaCount +
    jemaatCount +
    eventCount +
    profileCount +
    baptisanCount +
    pernikahanCount +
    kematianCount;

  if (relationCount > 0) {
    throw new AppError("Unit gereja tidak dapat dihapus karena masih mempunyai data terkait.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await prisma.unitGereja.update({
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

export async function getActiveUnitGerejaOptions() {
  return prisma.unitGereja.findMany({
    where: {
      aktif: true,
      deletedAt: null,
    },
    select: {
      id: true,
      kode: true,
      nama: true,
      jenis: true,
    },
    orderBy: [
      {
        jenis: "asc",
      },
      {
        nama: "asc",
      },
    ],
  });
}
