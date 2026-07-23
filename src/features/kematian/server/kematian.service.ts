import "server-only";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import {
  AlasanTidakAktif,
  Prisma,
  StatusJemaat,
  StatusPencatatanKematian,
} from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

import type {
  CreateKematianInput,
  JemaatKematianOptionsQuery,
  KematianListQuery,
  UpdateKematianInput,
} from "../schemas/kematian.schema";
import type { JemaatKematianOption, KematianListItem } from "../types";

const kematianSelect = {
  id: true,
  jemaatId: true,
  unitGerejaId: true,

  tanggalMeninggal: true,
  waktuMeninggal: true,
  tempatMeninggal: true,
  penyebabKematian: true,
  umurSaatMeninggal: true,

  nomorSuratKematian: true,
  instansiPenerbit: true,
  dokumenSuratKematian: true,
  alamatRumahDuka: true,

  tanggalIbadahPenghiburan: true,
  waktuIbadahPenghiburan: true,
  lokasiIbadahPenghiburan: true,
  namaPelayanPenghiburan: true,
  temaPelayanan: true,
  catatanPelayanan: true,

  tanggalPemakaman: true,
  waktuPemakaman: true,
  lokasiPemakaman: true,
  namaTempatPemakaman: true,
  namaPelayanPemakaman: true,
  nomorLokasiMakam: true,
  keteranganPemakaman: true,

  status: true,
  keterangan: true,

  jemaat: {
    select: {
      id: true,
      unitGerejaId: true,
      nomorIndukGereja: true,
      namaLengkap: true,
      tanggalLahir: true,
      foto: true,

      wilayah: {
        select: {
          id: true,
          nama: true,
        },
      },

      keluarga: {
        select: {
          id: true,
          namaKepalaKeluarga: true,
        },
      },

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      },
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
} satisfies Prisma.KematianSelect;

type KematianPayload = Prisma.KematianGetPayload<{
  select: typeof kematianSelect;
}>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function toDatabaseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function toDatabaseTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`1970-01-01T${value}:00.000Z`);
}

function toDateInput(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? null;
}

function toTimeInput(value: Date | null) {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(11, 16);
}

function calculateAgeAtDeath(birthDate: Date | null, deathDate: Date): number | null {
  if (!birthDate) {
    return null;
  }

  let age = deathDate.getUTCFullYear() - birthDate.getUTCFullYear();

  const deathMonth = deathDate.getUTCMonth();
  const birthMonth = birthDate.getUTCMonth();

  const birthdayHasNotOccurred =
    deathMonth < birthMonth ||
    (deathMonth === birthMonth && deathDate.getUTCDate() < birthDate.getUTCDate());

  if (birthdayHasNotOccurred) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function mapKematian(kematian: KematianPayload): KematianListItem {
  return {
    id: kematian.id,
    jemaatId: kematian.jemaatId,
    unitGerejaId: kematian.unitGerejaId,

    tanggalMeninggal: toDateInput(kematian.tanggalMeninggal)!,

    waktuMeninggal: toTimeInput(kematian.waktuMeninggal),

    tempatMeninggal: kematian.tempatMeninggal,
    penyebabKematian: kematian.penyebabKematian,
    umurSaatMeninggal: kematian.umurSaatMeninggal,

    nomorSuratKematian: kematian.nomorSuratKematian,
    instansiPenerbit: kematian.instansiPenerbit,
    dokumenSuratKematian: kematian.dokumenSuratKematian,
    alamatRumahDuka: kematian.alamatRumahDuka,

    tanggalIbadahPenghiburan: toDateInput(kematian.tanggalIbadahPenghiburan),

    waktuIbadahPenghiburan: toTimeInput(kematian.waktuIbadahPenghiburan),

    lokasiIbadahPenghiburan: kematian.lokasiIbadahPenghiburan,

    namaPelayanPenghiburan: kematian.namaPelayanPenghiburan,

    temaPelayanan: kematian.temaPelayanan,
    catatanPelayanan: kematian.catatanPelayanan,

    tanggalPemakaman: toDateInput(kematian.tanggalPemakaman),

    waktuPemakaman: toTimeInput(kematian.waktuPemakaman),

    lokasiPemakaman: kematian.lokasiPemakaman,
    namaTempatPemakaman: kematian.namaTempatPemakaman,

    namaPelayanPemakaman: kematian.namaPelayanPemakaman,

    nomorLokasiMakam: kematian.nomorLokasiMakam,
    keteranganPemakaman: kematian.keteranganPemakaman,

    status: kematian.status,
    keterangan: kematian.keterangan,

    jemaat: {
      ...kematian.jemaat,

      tanggalLahir: toDateInput(kematian.jemaat.tanggalLahir),
    },

    unitGereja: kematian.unitGereja,

    createdAt: kematian.createdAt.toISOString(),
    updatedAt: kematian.updatedAt.toISOString(),
  };
}

async function createUnitScope(
  actor: AppActor,
  requestedUnitId?: string,
): Promise<Prisma.KematianWhereInput> {
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
    currentKematianId?: string;
    allowCurrentInactive?: boolean;
  },
) {
  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id: jemaatId,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      namaLengkap: true,
      tanggalLahir: true,
      status: true,

      kematian: {
        select: {
          id: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!jemaat) {
    throw new AppError("Data Jemaat tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",

      fieldErrors: {
        jemaatId: ["Data Jemaat tidak ditemukan."],
      },
    });
  }

  await assertCanAccessUnit(actor, jemaat.unitGerejaId);

  const isCurrentJemaat = jemaat.kematian?.id === options?.currentKematianId;

  if (jemaat.status !== StatusJemaat.AKTIF && !(options?.allowCurrentInactive && isCurrentJemaat)) {
    throw new AppError("Pencatatan kematian hanya dapat dibuat untuk Jemaat aktif.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        jemaatId: ["Pilih Jemaat yang masih aktif."],
      },
    });
  }

  const hasOtherActiveRecord =
    jemaat.kematian &&
    jemaat.kematian.deletedAt === null &&
    jemaat.kematian.id !== options?.currentKematianId;

  if (hasOtherActiveRecord) {
    throw new AppError("Jemaat sudah mempunyai pencatatan kematian.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        jemaatId: ["Jemaat sudah mempunyai pencatatan kematian."],
      },
    });
  }

  return jemaat;
}

async function assertDeathCertificateAvailable(value: string | null, excludedId?: string) {
  if (!value) {
    return;
  }

  const duplicate = await prisma.kematian.findFirst({
    where: {
      nomorSuratKematian: value,

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
    throw new AppError("Nomor surat kematian sudah digunakan.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        nomorSuratKematian: ["Nomor surat kematian sudah digunakan."],
      },
    });
  }
}

function assertStatusTransition(
  currentStatus: StatusPencatatanKematian,
  nextStatus: StatusPencatatanKematian,
) {
  if (
    currentStatus === StatusPencatatanKematian.TERVERIFIKASI &&
    nextStatus !== StatusPencatatanKematian.TERVERIFIKASI
  ) {
    throw new AppError("Pencatatan kematian yang sudah terverifikasi bersifat final.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (
    currentStatus === StatusPencatatanKematian.DIBATALKAN &&
    nextStatus === StatusPencatatanKematian.TERVERIFIKASI
  ) {
    throw new AppError(
      "Pencatatan yang dibatalkan harus dikembalikan menjadi draft terlebih dahulu.",
      {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          status: ["Ubah status menjadi Draft sebelum melakukan verifikasi."],
        },
      },
    );
  }
}

function assertNotFutureDate(value: string) {
  const selectedDate = toDatabaseDate(value)!;

  const today = new Date();
  const currentDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (selectedDate > currentDate) {
    throw new AppError("Tanggal meninggal tidak boleh berada di masa mendatang.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        tanggalMeninggal: ["Tanggal meninggal tidak boleh berada di masa mendatang."],
      },
    });
  }
}

function getOrderBy(
  sortBy: KematianListQuery["sortBy"],
  sortOrder: KematianListQuery["sortOrder"],
): Prisma.KematianOrderByWithRelationInput {
  switch (sortBy) {
    case "namaJemaat":
      return {
        jemaat: {
          namaLengkap: sortOrder,
        },
      };

    case "umurSaatMeninggal":
      return {
        umurSaatMeninggal: sortOrder,
      };

    case "nomorSuratKematian":
      return {
        nomorSuratKematian: sortOrder,
      };

    case "status":
      return {
        status: sortOrder,
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

    case "tanggalMeninggal":
    default:
      return {
        tanggalMeninggal: sortOrder,
      };
  }
}

function getKematianData(
  input: CreateKematianInput | UpdateKematianInput,
  jemaat: {
    unitGerejaId: string;
    tanggalLahir: Date | null;
  },
) {
  const tanggalMeninggal = toDatabaseDate(input.tanggalMeninggal)!;

  return {
    jemaatId: input.jemaatId,
    unitGerejaId: jemaat.unitGerejaId,

    tanggalMeninggal,

    waktuMeninggal: toDatabaseTime(input.waktuMeninggal),

    tempatMeninggal: normalizeOptionalText(input.tempatMeninggal),

    penyebabKematian: normalizeOptionalText(input.penyebabKematian),

    umurSaatMeninggal: calculateAgeAtDeath(jemaat.tanggalLahir, tanggalMeninggal),

    nomorSuratKematian: normalizeOptionalText(input.nomorSuratKematian),

    instansiPenerbit: normalizeOptionalText(input.instansiPenerbit),

    dokumenSuratKematian: normalizeOptionalText(input.dokumenSuratKematian),

    alamatRumahDuka: normalizeOptionalText(input.alamatRumahDuka),

    tanggalIbadahPenghiburan: toDatabaseDate(input.tanggalIbadahPenghiburan),

    waktuIbadahPenghiburan: toDatabaseTime(input.waktuIbadahPenghiburan),

    lokasiIbadahPenghiburan: normalizeOptionalText(input.lokasiIbadahPenghiburan),

    namaPelayanPenghiburan: normalizeOptionalText(input.namaPelayanPenghiburan),

    temaPelayanan: normalizeOptionalText(input.temaPelayanan),

    catatanPelayanan: normalizeOptionalText(input.catatanPelayanan),

    tanggalPemakaman: toDatabaseDate(input.tanggalPemakaman),

    waktuPemakaman: toDatabaseTime(input.waktuPemakaman),

    lokasiPemakaman: normalizeOptionalText(input.lokasiPemakaman),

    namaTempatPemakaman: normalizeOptionalText(input.namaTempatPemakaman),

    namaPelayanPemakaman: normalizeOptionalText(input.namaPelayanPemakaman),

    nomorLokasiMakam: normalizeOptionalText(input.nomorLokasiMakam),

    keteranganPemakaman: normalizeOptionalText(input.keteranganPemakaman),

    status: input.status,

    keterangan: normalizeOptionalText(input.keterangan),
  };
}

function getVerifiedJemaatUpdate(input: CreateKematianInput | UpdateKematianInput) {
  return {
    status: StatusJemaat.TIDAK_AKTIF,
    tanggalTidakAktif: toDatabaseDate(input.tanggalMeninggal),

    alasanTidakAktif: AlasanTidakAktif.MENINGGAL,

    keteranganTidakAktif: "Status diperbarui melalui pencatatan kematian terverifikasi.",
  };
}

function throwKematianConstraintError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(",")
      : String(error.meta?.target ?? "");

    if (target.includes("jemaatId")) {
      throw new AppError("Jemaat sudah mempunyai pencatatan kematian.", {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          jemaatId: ["Jemaat sudah mempunyai pencatatan kematian."],
        },
      });
    }

    if (target.includes("nomorSuratKematian")) {
      throw new AppError("Nomor surat kematian sudah digunakan.", {
        status: 409,
        code: "CONFLICT",

        fieldErrors: {
          nomorSuratKematian: ["Nomor surat kematian sudah digunakan."],
        },
      });
    }
  }

  throw error;
}

export async function getKematianList(actor: AppActor, params: KematianListQuery) {
  const { q, page, pageSize, unitGerejaId, status, tanggalDari, tanggalSampai, sortBy, sortOrder } =
    params;

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const where: Prisma.KematianWhereInput = {
    deletedAt: null,
    ...unitScope,

    ...(status
      ? {
          status,
        }
      : {}),

    ...(tanggalDari || tanggalSampai
      ? {
          tanggalMeninggal: {
            ...(tanggalDari
              ? {
                  gte: toDatabaseDate(tanggalDari)!,
                }
              : {}),

            ...(tanggalSampai
              ? {
                  lte: toDatabaseDate(tanggalSampai)!,
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
              nomorSuratKematian: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              instansiPenerbit: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              tempatMeninggal: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              namaTempatPemakaman: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.kematian.findMany({
      where,
      select: kematianSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.kematian.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapKematian),

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

export async function getKematianById(actor: AppActor, id: string) {
  const kematian = await prisma.kematian.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: kematianSelect,
  });

  if (!kematian) {
    throw new AppError("Data kematian tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, kematian.unitGerejaId);

  return mapKematian(kematian);
}

export async function createKematian(actor: AppActor, input: CreateKematianInput) {
  if (input.status === StatusPencatatanKematian.DIBATALKAN) {
    throw new AppError("Pencatatan baru tidak dapat langsung dibatalkan.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        status: ["Pilih status Draft atau Terverifikasi."],
      },
    });
  }

  assertNotFutureDate(input.tanggalMeninggal);

  const jemaat = await getTargetJemaat(actor, input.jemaatId);

  const nomorSuratKematian = normalizeOptionalText(input.nomorSuratKematian);

  const deletedRecord = await prisma.kematian.findFirst({
    where: {
      jemaatId: input.jemaatId,
      deletedAt: {
        not: null,
      },
    },

    select: {
      id: true,
    },
  });

  await assertDeathCertificateAvailable(nomorSuratKematian, deletedRecord?.id);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const data = getKematianData(input, jemaat);

      const kematian = deletedRecord
        ? await tx.kematian.update({
            where: {
              id: deletedRecord.id,
            },

            data: {
              ...data,
              deletedAt: null,
            },

            select: kematianSelect,
          })
        : await tx.kematian.create({
            data,
            select: kematianSelect,
          });

      if (input.status === StatusPencatatanKematian.TERVERIFIKASI) {
        await tx.jemaat.update({
          where: {
            id: input.jemaatId,
          },

          data: getVerifiedJemaatUpdate(input),
        });
      }

      return kematian;
    });

    return mapKematian(result);
  } catch (error) {
    throwKematianConstraintError(error);
  }
}

export async function updateKematian(actor: AppActor, id: string, input: UpdateKematianInput) {
  const current = await prisma.kematian.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      jemaatId: true,
      unitGerejaId: true,
      status: true,
    },
  });

  if (!current) {
    throw new AppError("Data kematian tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  if (current.status === StatusPencatatanKematian.TERVERIFIKASI) {
    throw new AppError("Pencatatan kematian yang sudah terverifikasi tidak dapat diubah.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  assertStatusTransition(current.status, input.status);

  assertNotFutureDate(input.tanggalMeninggal);

  const jemaat = await getTargetJemaat(actor, input.jemaatId, {
    currentKematianId: id,

    allowCurrentInactive: current.jemaatId === input.jemaatId,
  });

  await assertDeathCertificateAvailable(normalizeOptionalText(input.nomorSuratKematian), id);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const kematian = await tx.kematian.update({
        where: {
          id,
        },

        data: getKematianData(input, jemaat),

        select: kematianSelect,
      });

      if (input.status === StatusPencatatanKematian.TERVERIFIKASI) {
        await tx.jemaat.update({
          where: {
            id: input.jemaatId,
          },

          data: getVerifiedJemaatUpdate(input),
        });
      }

      return kematian;
    });

    return mapKematian(result);
  } catch (error) {
    throwKematianConstraintError(error);
  }
}

export async function deleteKematian(actor: AppActor, id: string) {
  const current = await prisma.kematian.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      status: true,
    },
  });

  if (!current) {
    throw new AppError("Data kematian tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, current.unitGerejaId);

  if (current.status === StatusPencatatanKematian.TERVERIFIKASI) {
    throw new AppError("Pencatatan kematian yang sudah terverifikasi tidak dapat dihapus.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await prisma.kematian.update({
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

export async function getJemaatKematianOptions(
  actor: AppActor,
  params: JemaatKematianOptionsQuery,
): Promise<JemaatKematianOption[]> {
  const { q, unitGerejaId, currentKematianId } = params;

  if (unitGerejaId) {
    await assertCanAccessUnit(actor, unitGerejaId);
  }

  const accessibleUnitIds = unitGerejaId ? [unitGerejaId] : await getAccessibleUnitIds(actor);

  const currentKematian = currentKematianId
    ? await prisma.kematian.findFirst({
        where: {
          id: currentKematianId,
          deletedAt: null,
        },

        select: {
          id: true,
          unitGerejaId: true,
        },
      })
    : null;

  if (currentKematian) {
    await assertCanAccessUnit(actor, currentKematian.unitGerejaId);
  }

  const eligibilityFilters: Prisma.JemaatWhereInput[] = [
    {
      status: StatusJemaat.AKTIF,

      OR: [
        {
          kematian: {
            is: null,
          },
        },
        {
          kematian: {
            is: {
              deletedAt: {
                not: null,
              },
            },
          },
        },
      ],
    },
  ];

  if (currentKematianId) {
    eligibilityFilters.push({
      kematian: {
        is: {
          id: currentKematianId,
          deletedAt: null,
        },
      },
    });
  }

  return prisma.jemaat
    .findMany({
      where: {
        deletedAt: null,

        unitGerejaId: {
          in: accessibleUnitIds,
        },

        AND: [
          {
            OR: eligibilityFilters,
          },

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
        tanggalLahir: true,

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
    })
    .then((items) =>
      items.map((item) => ({
        ...item,
        tanggalLahir: toDateInput(item.tanggalLahir),
      })),
    );
}
