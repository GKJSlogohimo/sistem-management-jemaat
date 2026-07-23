import "server-only";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import { type JenisBaptisan, Prisma, StatusJemaat } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

import type {
  BaptisanListParams,
  CreateBaptisanInput,
  JemaatBaptisanOptionsParams,
  UpdateBaptisanInput,
} from "../schemas/baptisan.schema";
import type { BaptisanListItem, JemaatBaptisanOption } from "../types";

const baptisanSelect = {
  id: true,
  jemaatId: true,
  unitGerejaId: true,

  jenis: true,
  tanggalBaptisan: true,
  tempatBaptisan: true,
  namaPelayan: true,
  nomorSertifikat: true,
  dokumen: true,
  keterangan: true,

  jemaat: {
    select: {
      id: true,
      nomorIndukGereja: true,
      namaLengkap: true,
    },
  },

  unitGereja: {
    select: {
      id: true,
      kode: true,
      nama: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BaptisanSelect;

type BaptisanPayload = Prisma.BaptisanGetPayload<{
  select: typeof baptisanSelect;
}>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function toDatabaseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function mapBaptisan(baptisan: BaptisanPayload): BaptisanListItem {
  return {
    id: baptisan.id,
    jemaatId: baptisan.jemaatId,
    unitGerejaId: baptisan.unitGerejaId,

    jenis: baptisan.jenis,
    tanggalBaptisan: toDateInput(baptisan.tanggalBaptisan),

    tempatBaptisan: baptisan.tempatBaptisan,
    namaPelayan: baptisan.namaPelayan,
    nomorSertifikat: baptisan.nomorSertifikat,
    dokumen: baptisan.dokumen,
    keterangan: baptisan.keterangan,

    jemaat: baptisan.jemaat,
    unitGereja: baptisan.unitGereja,

    createdAt: baptisan.createdAt.toISOString(),
    updatedAt: baptisan.updatedAt.toISOString(),
  };
}

async function createUnitScope(
  actor: AppActor,
  requestedUnitId?: string,
): Promise<Prisma.BaptisanWhereInput> {
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
  jemaatId: string,
  options?: {
    allowInactive?: boolean;
  },
) {
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
      status: true,
      namaLengkap: true,
    },
  });

  if (!jemaat) {
    throw new AppError(
      options?.allowInactive
        ? "Data jemaat tidak ditemukan."
        : "Jemaat tidak ditemukan atau sudah tidak aktif.",
      {
        status: 422,
        code: "VALIDATION_ERROR",
        fieldErrors: {
          jemaatId: [
            options?.allowInactive
              ? "Pilih data jemaat yang valid."
              : "Pilih jemaat yang masih aktif.",
          ],
        },
      },
    );
  }

  await assertCanAccessUnit(actor, jemaat.unitGerejaId);

  return jemaat;
}

async function assertNoDuplicateActiveBaptisan(
  jemaatId: string,
  jenis: JenisBaptisan,
  excludedId?: string,
) {
  const duplicate = await prisma.baptisan.findFirst({
    where: {
      jemaatId,
      jenis,
      deletedAt: null,

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

  if (duplicate) {
    throw new AppError("Jenis pencatatan tersebut sudah dimiliki oleh jemaat.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        jenis: ["Jemaat sudah mempunyai pencatatan aktif untuk jenis ini."],
        jemaatId: ["Pilih jemaat lain atau periksa data Baptisan sebelumnya."],
      },
    });
  }
}

async function assertCertificateAvailable(nomorSertifikat: string | null, excludedId?: string) {
  if (!nomorSertifikat) {
    return;
  }

  const duplicate = await prisma.baptisan.findFirst({
    where: {
      nomorSertifikat,

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

  if (duplicate) {
    throw new AppError("Nomor sertifikat sudah digunakan.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        nomorSertifikat: ["Nomor sertifikat sudah digunakan."],
      },
    });
  }
}

function throwBaptisanConstraintError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(",")
      : String(error.meta?.target ?? "");

    if (target.includes("nomorSertifikat")) {
      throw new AppError("Nomor sertifikat sudah digunakan.", {
        status: 409,
        code: "CONFLICT",
        fieldErrors: {
          nomorSertifikat: ["Nomor sertifikat sudah digunakan."],
        },
      });
    }

    throw new AppError("Data Baptisan tersebut sudah tercatat.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        jemaatId: ["Jemaat sudah mempunyai pencatatan aktif untuk jenis ini."],
        jenis: ["Jenis Baptisan yang sama tidak dapat dicatat dua kali."],
      },
    });
  }

  throw error;
}

function getOrderBy(
  sortBy: BaptisanListParams["sortBy"],
  sortOrder: BaptisanListParams["sortOrder"],
): Prisma.BaptisanOrderByWithRelationInput {
  switch (sortBy) {
    case "namaJemaat":
      return {
        jemaat: {
          namaLengkap: sortOrder,
        },
      };

    case "jenis":
      return {
        jenis: sortOrder,
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

    case "tanggalBaptisan":
    default:
      return {
        tanggalBaptisan: sortOrder,
      };
  }
}

export async function getBaptisanList(actor: AppActor, params: BaptisanListParams) {
  const { q, page, pageSize, unitGerejaId, jenis, tanggalDari, tanggalSampai, sortBy, sortOrder } =
    params;

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const where: Prisma.BaptisanWhereInput = {
    deletedAt: null,
    ...unitScope,

    ...(jenis
      ? {
          jenis,
        }
      : {}),

    ...(tanggalDari || tanggalSampai
      ? {
          tanggalBaptisan: {
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
              jemaat: {
                is: {
                  namaLengkap: {
                    contains: q,
                    mode: "insensitive",
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
              nomorSertifikat: {
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
              tempatBaptisan: {
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
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.baptisan.findMany({
      where,
      select: baptisanSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.baptisan.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapBaptisan),

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

export async function getBaptisanById(actor: AppActor, id: string) {
  const baptisan = await prisma.baptisan.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: baptisanSelect,
  });

  if (!baptisan) {
    throw new AppError("Data Baptisan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, baptisan.unitGerejaId);

  return mapBaptisan(baptisan);
}

export async function createBaptisan(actor: AppActor, input: CreateBaptisanInput) {
  const jemaat = await getTargetJemaat(actor, input.jemaatId);

  const nomorSertifikat = normalizeOptionalText(input.nomorSertifikat);

  await assertNoDuplicateActiveBaptisan(input.jemaatId, input.jenis);

  await assertCertificateAvailable(nomorSertifikat);

  try {
    const baptisan = await prisma.baptisan.create({
      data: {
        jemaatId: jemaat.id,
        unitGerejaId: jemaat.unitGerejaId,

        jenis: input.jenis,
        tanggalBaptisan: toDatabaseDate(input.tanggalBaptisan),

        tempatBaptisan: normalizeOptionalText(input.tempatBaptisan),
        namaPelayan: normalizeOptionalText(input.namaPelayan),
        nomorSertifikat,
        dokumen: normalizeOptionalText(input.dokumen),
        keterangan: normalizeOptionalText(input.keterangan),
      },

      select: baptisanSelect,
    });

    return mapBaptisan(baptisan);
  } catch (error) {
    throwBaptisanConstraintError(error);
  }
}

export async function updateBaptisan(actor: AppActor, id: string, input: UpdateBaptisanInput) {
  const current = await prisma.baptisan.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      jemaatId: true,
      unitGerejaId: true,
    },
  });

  if (!current) {
    throw new AppError("Data Baptisan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  /*
   * Jemaat lama boleh sudah tidak aktif karena
   * data Baptisan merupakan riwayat gerejawi.
   * Jemaat baru harus masih aktif.
   */
  const targetJemaat = await getTargetJemaat(actor, input.jemaatId, {
    allowInactive: input.jemaatId === current.jemaatId,
  });

  const nomorSertifikat = normalizeOptionalText(input.nomorSertifikat);

  await assertNoDuplicateActiveBaptisan(input.jemaatId, input.jenis, id);

  await assertCertificateAvailable(nomorSertifikat, id);

  try {
    const baptisan = await prisma.baptisan.update({
      where: {
        id,
      },

      data: {
        jemaatId: targetJemaat.id,
        unitGerejaId: targetJemaat.unitGerejaId,

        jenis: input.jenis,
        tanggalBaptisan: toDatabaseDate(input.tanggalBaptisan),

        tempatBaptisan: normalizeOptionalText(input.tempatBaptisan),
        namaPelayan: normalizeOptionalText(input.namaPelayan),
        nomorSertifikat,
        dokumen: normalizeOptionalText(input.dokumen),
        keterangan: normalizeOptionalText(input.keterangan),
      },

      select: baptisanSelect,
    });

    return mapBaptisan(baptisan);
  } catch (error) {
    throwBaptisanConstraintError(error);
  }
}

export async function deleteBaptisan(actor: AppActor, id: string) {
  const current = await prisma.baptisan.findFirst({
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
    throw new AppError("Data Baptisan tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  await prisma.baptisan.update({
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

export async function getJemaatBaptisanOptions(
  actor: AppActor,
  params: JemaatBaptisanOptionsParams,
): Promise<JemaatBaptisanOption[]> {
  const { q, unitGerejaId, jenis, currentBaptisanId } = params;

  const accessibleUnitIds = unitGerejaId ? [unitGerejaId] : await getAccessibleUnitIds(actor);

  if (unitGerejaId) {
    await assertCanAccessUnit(actor, unitGerejaId);
  }

  return prisma.jemaat.findMany({
    where: {
      unitGerejaId: {
        in: accessibleUnitIds,
      },

      status: StatusJemaat.AKTIF,
      deletedAt: null,

      ...(q
        ? {
            OR: [
              {
                namaLengkap: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                nomorIndukGereja: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(jenis
        ? {
            baptisan: {
              none: {
                jenis,
                deletedAt: null,

                ...(currentBaptisanId
                  ? {
                      id: {
                        not: currentBaptisanId,
                      },
                    }
                  : {}),
              },
            },
          }
        : {}),
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
