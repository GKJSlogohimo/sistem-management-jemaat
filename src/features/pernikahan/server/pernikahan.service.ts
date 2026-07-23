import "server-only";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import { Prisma, StatusJemaat } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

import type {
  CreatePernikahanInput,
  JemaatPernikahanOptionsQuery,
  PernikahanListQuery,
  UpdatePernikahanInput,
} from "../schemas/pernikahan.schema";
import type { JemaatPernikahanOption, PernikahanListItem } from "../types";

const pernikahanSelect = {
  id: true,
  unitGerejaId: true,

  nomorPencatatan: true,
  nomorSertifikat: true,

  tanggalPernikahan: true,
  tempatPernikahan: true,
  namaPelayan: true,

  jemaatPihakSatuId: true,
  namaPihakSatu: true,

  jemaatPihakDuaId: true,
  namaPihakDua: true,

  namaSaksiSatu: true,
  namaSaksiDua: true,

  dokumen: true,
  keterangan: true,

  unitGereja: {
    select: {
      id: true,
      kode: true,
      nama: true,
    },
  },

  jemaatPihakSatu: {
    select: {
      id: true,
      unitGerejaId: true,
      nomorIndukGereja: true,
      namaLengkap: true,

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
    },
  },

  jemaatPihakDua: {
    select: {
      id: true,
      unitGerejaId: true,
      nomorIndukGereja: true,
      namaLengkap: true,

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PernikahanSelect;

type PernikahanPayload = Prisma.PernikahanGetPayload<{
  select: typeof pernikahanSelect;
}>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalId(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function toDatabaseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function mapPernikahan(pernikahan: PernikahanPayload): PernikahanListItem {
  return {
    id: pernikahan.id,
    unitGerejaId: pernikahan.unitGerejaId,

    nomorPencatatan: pernikahan.nomorPencatatan,
    nomorSertifikat: pernikahan.nomorSertifikat,

    tanggalPernikahan: toDateInput(pernikahan.tanggalPernikahan),
    tempatPernikahan: pernikahan.tempatPernikahan,
    namaPelayan: pernikahan.namaPelayan,

    jemaatPihakSatuId: pernikahan.jemaatPihakSatuId,
    namaPihakSatu: pernikahan.namaPihakSatu,
    jemaatPihakSatu: pernikahan.jemaatPihakSatu,

    jemaatPihakDuaId: pernikahan.jemaatPihakDuaId,
    namaPihakDua: pernikahan.namaPihakDua,
    jemaatPihakDua: pernikahan.jemaatPihakDua,

    namaSaksiSatu: pernikahan.namaSaksiSatu,
    namaSaksiDua: pernikahan.namaSaksiDua,

    dokumen: pernikahan.dokumen,
    keterangan: pernikahan.keterangan,

    unitGereja: pernikahan.unitGereja,

    createdAt: pernikahan.createdAt.toISOString(),
    updatedAt: pernikahan.updatedAt.toISOString(),
  };
}

async function createUnitScope(
  actor: AppActor,
  requestedUnitId?: string,
): Promise<Prisma.PernikahanWhereInput> {
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

async function getTargetJemaat(
  actor: AppActor,
  jemaatId: string | null,
  options?: {
    allowInactive?: boolean;
  },
) {
  if (!jemaatId) {
    return null;
  }

  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id: jemaatId,
      deletedAt: null,

      ...(options?.allowInactive
        ? {}
        : {
            status: StatusJemaat.AKTIF,
          }),
    },

    select: {
      id: true,
      unitGerejaId: true,
      namaLengkap: true,
      status: true,
    },
  });

  if (!jemaat) {
    throw new AppError(
      options?.allowInactive
        ? "Data Jemaat tidak ditemukan."
        : "Jemaat tidak ditemukan atau sudah tidak aktif.",
      {
        status: 422,
        code: "VALIDATION_ERROR",
      },
    );
  }

  await assertCanAccessUnit(actor, jemaat.unitGerejaId);

  return jemaat;
}

async function assertNumberAvailable(
  field: "nomorPencatatan" | "nomorSertifikat",
  value: string | null,
  excludedId?: string,
) {
  if (!value) {
    return;
  }

  const duplicate = await prisma.pernikahan.findFirst({
    where: {
      [field]: value,

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

  if (!duplicate) {
    return;
  }

  const label = field === "nomorPencatatan" ? "Nomor pencatatan" : "Nomor sertifikat";

  throw new AppError(`${label} sudah digunakan.`, {
    status: 409,
    code: "CONFLICT",

    fieldErrors: {
      [field]: [`${label} sudah digunakan.`],
    },
  });
}

function throwPernikahanConstraintError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(",")
      : String(error.meta?.target ?? "");

    if (target.includes("nomorPencatatan")) {
      throw new AppError("Nomor pencatatan sudah digunakan.", {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          nomorPencatatan: ["Nomor pencatatan sudah digunakan."],
        },
      });
    }

    if (target.includes("nomorSertifikat")) {
      throw new AppError("Nomor sertifikat sudah digunakan.", {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          nomorSertifikat: ["Nomor sertifikat sudah digunakan."],
        },
      });
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2004") {
    throw new AppError("Minimal salah satu pihak harus merupakan Jemaat.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatPihakSatuId: ["Pilih minimal salah satu pihak dari data Jemaat."],
        jemaatPihakDuaId: ["Pilih minimal salah satu pihak dari data Jemaat."],
      },
    });
  }

  throw error;
}

function getOrderBy(
  sortBy: PernikahanListQuery["sortBy"],
  sortOrder: PernikahanListQuery["sortOrder"],
): Prisma.PernikahanOrderByWithRelationInput {
  switch (sortBy) {
    case "namaPihakSatu":
      return {
        namaPihakSatu: sortOrder,
      };

    case "namaPihakDua":
      return {
        namaPihakDua: sortOrder,
      };

    case "nomorPencatatan":
      return {
        nomorPencatatan: sortOrder,
      };

    case "nomorSertifikat":
      return {
        nomorSertifikat: sortOrder,
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

    case "tanggalPernikahan":
    default:
      return {
        tanggalPernikahan: sortOrder,
      };
  }
}

export async function getPernikahanList(actor: AppActor, params: PernikahanListQuery) {
  const { q, page, pageSize, unitGerejaId, tanggalDari, tanggalSampai, sortBy, sortOrder } = params;

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const where: Prisma.PernikahanWhereInput = {
    deletedAt: null,
    ...unitScope,

    ...(tanggalDari || tanggalSampai
      ? {
          tanggalPernikahan: {
            ...(tanggalDari
              ? {
                  gte: toDatabaseDate(tanggalDari),
                }
              : {}),

            ...(tanggalSampai
              ? {
                  lte: toDatabaseDate(tanggalSampai),
                }
              : {}),
          },
        }
      : {}),

    ...(q
      ? {
          OR: [
            {
              namaPihakSatu: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              namaPihakDua: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              nomorPencatatan: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              nomorSertifikat: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              tempatPernikahan: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              namaPelayan: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              namaSaksiSatu: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              namaSaksiDua: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              jemaatPihakSatu: {
                is: {
                  nomorIndukGereja: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              jemaatPihakDua: {
                is: {
                  nomorIndukGereja: {
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
    prisma.pernikahan.findMany({
      where,
      select: pernikahanSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.pernikahan.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapPernikahan),

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

export async function getPernikahanById(actor: AppActor, id: string) {
  const pernikahan = await prisma.pernikahan.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: pernikahanSelect,
  });

  if (!pernikahan) {
    throw new AppError("Data Pernikahan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, pernikahan.unitGerejaId);

  return mapPernikahan(pernikahan);
}

export async function createPernikahan(actor: AppActor, input: CreatePernikahanInput) {
  await assertCanAccessUnit(actor, input.unitGerejaId);

  const pihakSatuId = normalizeOptionalId(input.jemaatPihakSatuId);
  const pihakDuaId = normalizeOptionalId(input.jemaatPihakDuaId);

  if (!pihakSatuId && !pihakDuaId) {
    throw new AppError("Minimal salah satu pihak harus merupakan Jemaat.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatPihakSatuId: ["Pilih minimal salah satu pihak dari data Jemaat."],
        jemaatPihakDuaId: ["Pilih minimal salah satu pihak dari data Jemaat."],
      },
    });
  }

  if (pihakSatuId && pihakDuaId && pihakSatuId === pihakDuaId) {
    throw new AppError("Pihak pertama dan kedua tidak boleh sama.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatPihakDuaId: ["Pilih Jemaat yang berbeda."],
      },
    });
  }

  const [pihakSatu, pihakDua] = await Promise.all([
    getTargetJemaat(actor, pihakSatuId),
    getTargetJemaat(actor, pihakDuaId),
  ]);

  const nomorPencatatan = normalizeOptionalText(input.nomorPencatatan);
  const nomorSertifikat = normalizeOptionalText(input.nomorSertifikat);

  await Promise.all([
    assertNumberAvailable("nomorPencatatan", nomorPencatatan),
    assertNumberAvailable("nomorSertifikat", nomorSertifikat),
  ]);

  try {
    const pernikahan = await prisma.pernikahan.create({
      data: {
        unitGerejaId: input.unitGerejaId,

        nomorPencatatan,
        nomorSertifikat,

        tanggalPernikahan: toDatabaseDate(input.tanggalPernikahan),
        tempatPernikahan: normalizeOptionalText(input.tempatPernikahan),
        namaPelayan: normalizeOptionalText(input.namaPelayan),

        jemaatPihakSatuId: pihakSatu?.id ?? null,
        namaPihakSatu: pihakSatu?.namaLengkap ?? input.namaPihakSatu.trim(),

        jemaatPihakDuaId: pihakDua?.id ?? null,
        namaPihakDua: pihakDua?.namaLengkap ?? input.namaPihakDua.trim(),

        namaSaksiSatu: normalizeOptionalText(input.namaSaksiSatu),
        namaSaksiDua: normalizeOptionalText(input.namaSaksiDua),

        dokumen: normalizeOptionalText(input.dokumen),
        keterangan: normalizeOptionalText(input.keterangan),
      },

      select: pernikahanSelect,
    });

    return mapPernikahan(pernikahan);
  } catch (error) {
    throwPernikahanConstraintError(error);
  }
}

export async function updatePernikahan(actor: AppActor, id: string, input: UpdatePernikahanInput) {
  const current = await prisma.pernikahan.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      jemaatPihakSatuId: true,
      jemaatPihakDuaId: true,
    },
  });

  if (!current) {
    throw new AppError("Data Pernikahan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);
  await assertCanAccessUnit(actor, input.unitGerejaId);

  const pihakSatuId = normalizeOptionalId(input.jemaatPihakSatuId);
  const pihakDuaId = normalizeOptionalId(input.jemaatPihakDuaId);

  if (!pihakSatuId && !pihakDuaId) {
    throw new AppError("Minimal salah satu pihak harus merupakan Jemaat.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatPihakSatuId: ["Pilih minimal salah satu pihak dari data Jemaat."],
        jemaatPihakDuaId: ["Pilih minimal salah satu pihak dari data Jemaat."],
      },
    });
  }

  if (pihakSatuId && pihakDuaId && pihakSatuId === pihakDuaId) {
    throw new AppError("Pihak pertama dan kedua tidak boleh sama.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatPihakDuaId: ["Pilih Jemaat yang berbeda."],
      },
    });
  }

  const currentPartyIds = new Set(
    [current.jemaatPihakSatuId, current.jemaatPihakDuaId].filter((value): value is string =>
      Boolean(value),
    ),
  );

  const [pihakSatu, pihakDua] = await Promise.all([
    getTargetJemaat(actor, pihakSatuId, {
      allowInactive: pihakSatuId ? currentPartyIds.has(pihakSatuId) : false,
    }),

    getTargetJemaat(actor, pihakDuaId, {
      allowInactive: pihakDuaId ? currentPartyIds.has(pihakDuaId) : false,
    }),
  ]);

  const nomorPencatatan = normalizeOptionalText(input.nomorPencatatan);
  const nomorSertifikat = normalizeOptionalText(input.nomorSertifikat);

  await Promise.all([
    assertNumberAvailable("nomorPencatatan", nomorPencatatan, id),
    assertNumberAvailable("nomorSertifikat", nomorSertifikat, id),
  ]);

  try {
    const pernikahan = await prisma.pernikahan.update({
      where: {
        id,
      },

      data: {
        unitGerejaId: input.unitGerejaId,

        nomorPencatatan,
        nomorSertifikat,

        tanggalPernikahan: toDatabaseDate(input.tanggalPernikahan),
        tempatPernikahan: normalizeOptionalText(input.tempatPernikahan),
        namaPelayan: normalizeOptionalText(input.namaPelayan),

        jemaatPihakSatuId: pihakSatu?.id ?? null,
        namaPihakSatu: pihakSatu?.namaLengkap ?? input.namaPihakSatu.trim(),

        jemaatPihakDuaId: pihakDua?.id ?? null,
        namaPihakDua: pihakDua?.namaLengkap ?? input.namaPihakDua.trim(),

        namaSaksiSatu: normalizeOptionalText(input.namaSaksiSatu),
        namaSaksiDua: normalizeOptionalText(input.namaSaksiDua),

        dokumen: normalizeOptionalText(input.dokumen),
        keterangan: normalizeOptionalText(input.keterangan),
      },

      select: pernikahanSelect,
    });

    return mapPernikahan(pernikahan);
  } catch (error) {
    throwPernikahanConstraintError(error);
  }
}

export async function deletePernikahan(actor: AppActor, id: string) {
  const current = await prisma.pernikahan.findFirst({
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
    throw new AppError("Data Pernikahan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  await prisma.pernikahan.update({
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

export async function getJemaatPernikahanOptions(
  actor: AppActor,
  params: JemaatPernikahanOptionsQuery,
): Promise<JemaatPernikahanOption[]> {
  const { q, unitGerejaId, currentPernikahanId } = params;

  const accessibleUnitIds = unitGerejaId ? [unitGerejaId] : await getAccessibleUnitIds(actor);

  if (unitGerejaId) {
    await assertCanAccessUnit(actor, unitGerejaId);
  }

  const currentPernikahan = currentPernikahanId
    ? await prisma.pernikahan.findFirst({
        where: {
          id: currentPernikahanId,
          deletedAt: null,
        },

        select: {
          unitGerejaId: true,
          jemaatPihakSatuId: true,
          jemaatPihakDuaId: true,
        },
      })
    : null;

  if (currentPernikahan) {
    await assertCanAccessUnit(actor, currentPernikahan.unitGerejaId);
  }

  const currentPartyIds = [
    currentPernikahan?.jemaatPihakSatuId,
    currentPernikahan?.jemaatPihakDuaId,
  ].filter((value): value is string => Boolean(value));

  const statusScope: Prisma.JemaatWhereInput =
    currentPartyIds.length > 0
      ? {
          OR: [
            {
              status: StatusJemaat.AKTIF,
            },
            {
              id: {
                in: currentPartyIds,
              },
            },
          ],
        }
      : {
          status: StatusJemaat.AKTIF,
        };

  return prisma.jemaat.findMany({
    where: {
      unitGerejaId: {
        in: accessibleUnitIds,
      },

      deletedAt: null,

      AND: [
        statusScope,

        ...(q
          ? [
              {
                OR: [
                  {
                    namaLengkap: {
                      contains: q,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    nomorIndukGereja: {
                      contains: q,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },

    select: {
      id: true,
      unitGerejaId: true,
      nomorIndukGereja: true,
      namaLengkap: true,

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
    },

    orderBy: {
      namaLengkap: "asc",
    },

    take: 100,
  });
}
