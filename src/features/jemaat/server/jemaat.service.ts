import "server-only";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import { AlasanTidakAktif, Prisma, StatusJemaat } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import { canReadNik, canReadNomorKK } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

import type {
  CreateJemaatInput,
  JemaatListItem,
  JemaatListParams,
  UpdateJemaatInput,
} from "../types";

const jemaatSelect = {
  id: true,
  nomorIndukGereja: true,
  nik: true,
  namaLengkap: true,
  namaPanggilan: true,
  jenisKelamin: true,
  tempatLahir: true,
  tanggalLahir: true,
  alamat: true,
  noHp: true,
  email: true,
  foto: true,

  status: true,
  tanggalTidakAktif: true,
  alasanTidakAktif: true,
  keteranganTidakAktif: true,

  unitGerejaId: true,
  wilayahId: true,
  keluargaId: true,

  unitGereja: {
    select: {
      id: true,
      kode: true,
      nama: true,
    },
  },

  wilayah: {
    select: {
      id: true,
      nama: true,
    },
  },

  keluarga: {
    select: {
      id: true,
      nomorKK: true,
      namaKepalaKeluarga: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.JemaatSelect;

type JemaatPayload = Prisma.JemaatGetPayload<{
  select: typeof jemaatSelect;
}>;

type JemaatInactiveInput = {
  status: StatusJemaat;

  tanggalTidakAktif?: string | null;

  alasanTidakAktif?: AlasanTidakAktif | null;

  keteranganTidakAktif?: string | null;
};

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeNik(value: string) {
  return value.trim();
}

function normalizeNomorInduk(value: string) {
  return value.trim().toUpperCase();
}

function toDatabaseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function mapJemaat(
  jemaat: JemaatPayload,
  permissions: {
    allowNik: boolean;
    allowNomorKK: boolean;
  },
): JemaatListItem {
  return {
    ...jemaat,

    /*
     * Jangan gunakan "-".
     * Null menandakan field memang
     * tidak diberikan oleh API.
     */
    nik: permissions.allowNik ? jemaat.nik : null,

    keluarga: {
      ...jemaat.keluarga,

      nomorKK: permissions.allowNomorKK ? jemaat.keluarga.nomorKK : null,
    },
    tanggalLahir: toDateInput(jemaat.tanggalLahir),

    tanggalTidakAktif: toDateInput(jemaat.tanggalTidakAktif),

    createdAt: jemaat.createdAt.toISOString(),

    updatedAt: jemaat.updatedAt.toISOString(),
  };
}

async function assertRelations(unitGerejaId: string, wilayahId: string, keluargaId: string) {
  const [unit, wilayah, keluarga] = await Promise.all([
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

    prisma.wilayah.findFirst({
      where: {
        id: wilayahId,
        unitGerejaId,
        deletedAt: null,
      },

      select: {
        id: true,
      },
    }),

    prisma.keluarga.findFirst({
      where: {
        id: keluargaId,
        unitGerejaId,
        deletedAt: null,
      },

      select: {
        id: true,
      },
    }),
  ]);

  const fieldErrors: Record<string, string[]> = {};

  if (!unit) {
    fieldErrors.unitGerejaId = ["Unit gereja tidak ditemukan atau tidak aktif."];
  }

  if (!wilayah) {
    fieldErrors.wilayahId = ["Wilayah tidak berasal dari unit gereja yang dipilih."];
  }

  if (!keluarga) {
    fieldErrors.keluargaId = ["Keluarga tidak berasal dari unit gereja yang dipilih."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Relasi data jemaat tidak valid.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors,
    });
  }
}

async function assertUniqueIdentifiers(nomorIndukGereja: string, nik: string, excludedId?: string) {
  const duplicates = await prisma.jemaat.findMany({
    where: {
      OR: [
        {
          nomorIndukGereja,
        },

        {
          nik,
        },
      ],

      ...(excludedId
        ? {
            id: {
              not: excludedId,
            },
          }
        : {}),
    },

    /*
     * Data soft-delete tetap dicek
     * karena constraint database
     * masih bersifat unique.
     */
    select: {
      nomorIndukGereja: true,
      nik: true,
    },
  });

  const fieldErrors: Record<string, string[]> = {};

  if (duplicates.some((item) => item.nomorIndukGereja === nomorIndukGereja)) {
    fieldErrors.nomorIndukGereja = ["Nomor induk gereja sudah digunakan."];
  }

  if (duplicates.some((item) => item.nik === nik)) {
    fieldErrors.nik = ["NIK sudah digunakan."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Nomor induk gereja atau NIK sudah digunakan.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors,
    });
  }
}

function throwIdentifierConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new AppError("Nomor induk gereja atau NIK sudah digunakan.", {
      status: 409,
      code: "CONFLICT",

      fieldErrors: {
        nomorIndukGereja: ["Periksa kembali nomor induk gereja."],

        nik: ["Periksa kembali NIK."],
      },
    });
  }

  throw error;
}

function getInactiveData(input: JemaatInactiveInput) {
  if (input.status === StatusJemaat.AKTIF) {
    return {
      tanggalTidakAktif: null,
      alasanTidakAktif: null,
      keteranganTidakAktif: null,
    };
  }

  if (input.alasanTidakAktif === AlasanTidakAktif.MENINGGAL) {
    throw new AppError("Status meninggal harus diproses melalui modul Kematian.", {
      status: 422,
      code: "VALIDATION_ERROR",

      fieldErrors: {
        alasanTidakAktif: ["Gunakan modul Kematian untuk mencatat jemaat meninggal."],
      },
    });
  }

  const fieldErrors: Record<string, string[]> = {};

  if (!input.tanggalTidakAktif) {
    fieldErrors.tanggalTidakAktif = ["Tanggal tidak aktif wajib diisi."];
  }

  if (!input.alasanTidakAktif) {
    fieldErrors.alasanTidakAktif = ["Alasan tidak aktif wajib dipilih."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Data status tidak aktif belum lengkap.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors,
    });
  }

  return {
    tanggalTidakAktif: toDatabaseDate(input.tanggalTidakAktif),

    alasanTidakAktif: input.alasanTidakAktif,

    keteranganTidakAktif: normalizeOptionalText(input.keteranganTidakAktif),
  };
}

function getOrderBy(
  sortBy: JemaatListParams["sortBy"],
  sortOrder: JemaatListParams["sortOrder"],
): Prisma.JemaatOrderByWithRelationInput {
  switch (sortBy) {
    case "nomorIndukGereja":
      return {
        nomorIndukGereja: sortOrder,
      };

    case "jenisKelamin":
      return {
        jenisKelamin: sortOrder,
      };

    case "status":
      return {
        status: sortOrder,
      };

    case "createdAt":
      return {
        createdAt: sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: sortOrder,
      };

    case "namaLengkap":
    default:
      return {
        namaLengkap: sortOrder,
      };
  }
}

async function createUnitScope(
  actor: AppActor,
  requestedUnitId?: string | null,
): Promise<Prisma.JemaatWhereInput> {
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

export async function getJemaatList(actor: AppActor, params: JemaatListParams) {
  const permissions = {
    allowNik: canReadNik(actor.peran),

    allowNomorKK: canReadNomorKK(actor.peran),
  };

  const { q, page, pageSize, unitGerejaId, wilayahId, jenisKelamin, status, sortBy, sortOrder } =
    params;

  const unitScope = await createUnitScope(actor, unitGerejaId);

  const searchConditions: Prisma.JemaatWhereInput[] = [];

  if (q) {
    searchConditions.push(
      {
        nomorIndukGereja: {
          contains: q,
          mode: "insensitive",
        },
      },

      {
        namaLengkap: {
          contains: q,
          mode: "insensitive",
        },
      },

      {
        namaPanggilan: {
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
            nama: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      },

      {
        wilayah: {
          is: {
            nama: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      },

      {
        keluarga: {
          is: {
            namaKepalaKeluarga: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      },
    );

    /*
     * Role tanpa izin NIK juga tidak
     * boleh mencari berdasarkan NIK.
     */
    if (permissions) {
      searchConditions.push({
        nik: {
          contains: q,
        },
      });
    }
  }

  const where: Prisma.JemaatWhereInput = {
    deletedAt: null,

    ...unitScope,

    ...(wilayahId
      ? {
          wilayahId,
        }
      : {}),

    ...(jenisKelamin
      ? {
          jenisKelamin,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(q
      ? {
          OR: searchConditions,
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.jemaat.findMany({
      where,
      select: jemaatSelect,

      orderBy: getOrderBy(sortBy, sortOrder),

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    prisma.jemaat.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map((jemaat) => mapJemaat(jemaat, permissions)),

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

export async function getJemaatById(actor: AppActor, id: string) {
  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: jemaatSelect,
  });

  if (!jemaat) {
    throw new AppError("Data jemaat tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, jemaat.unitGerejaId);

  return mapJemaat(jemaat, {
    allowNik: canReadNik(actor.peran),

    allowNomorKK: canReadNomorKK(actor.peran),
  });
}

export async function createJemaat(actor: AppActor, input: CreateJemaatInput) {
  await assertCanAccessUnit(actor, input.unitGerejaId);

  const nomorIndukGereja = normalizeNomorInduk(input.nomorIndukGereja);

  const nik = normalizeNik(input.nik);

  await assertRelations(input.unitGerejaId, input.wilayahId, input.keluargaId);

  await assertUniqueIdentifiers(nomorIndukGereja, nik);

  const inactiveData = getInactiveData(input);

  try {
    const jemaat = await prisma.jemaat.create({
      data: {
        nomorIndukGereja,
        nik,

        namaLengkap: input.namaLengkap.trim(),

        namaPanggilan: normalizeOptionalText(input.namaPanggilan),

        jenisKelamin: input.jenisKelamin,

        tempatLahir: normalizeOptionalText(input.tempatLahir),

        tanggalLahir: toDatabaseDate(input.tanggalLahir),

        alamat: normalizeOptionalText(input.alamat),

        noHp: normalizeOptionalText(input.noHp),

        email: normalizeOptionalText(input.email)?.toLowerCase() ?? null,

        foto: normalizeOptionalText(input.foto),

        status: input.status,

        ...inactiveData,

        unitGerejaId: input.unitGerejaId,

        wilayahId: input.wilayahId,

        keluargaId: input.keluargaId,
      },

      select: jemaatSelect,
    });

    return mapJemaat(jemaat, {
      allowNik: canReadNik(actor.peran),

      allowNomorKK: canReadNomorKK(actor.peran),
    });
  } catch (error) {
    throwIdentifierConflict(error);
  }
}

export async function updateJemaat(actor: AppActor, id: string, input: UpdateJemaatInput) {
  const current = await prisma.jemaat.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      nik: true,
      status: true,
      unitGerejaId: true,
      alasanTidakAktif: true,
      kematian: {
        select: {
          id: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!current) {
    throw new AppError("Data jemaat tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  /*
   * Actor harus memiliki akses ke
   * unit lama dan unit tujuan.
   */
  await assertCanAccessUnit(actor, current.unitGerejaId);

  await assertCanAccessUnit(actor, input.unitGerejaId);

  /*
   * Berdasarkan keputusan bisnis,
   * Jemaat yang sudah tidak aktif
   * tidak dapat diaktifkan kembali.
   */
  if (current.status === StatusJemaat.TIDAK_AKTIF && input.status === StatusJemaat.AKTIF) {
    throw new AppError("Jemaat yang sudah tidak aktif tidak dapat diaktifkan kembali.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (current.kematian && !current.kematian.deletedAt && input.status === StatusJemaat.AKTIF) {
    throw new AppError(
      "Jemaat yang sudah mempunyai pencatatan kematian tidak dapat diaktifkan kembali.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  if (
    current.status === StatusJemaat.TIDAK_AKTIF &&
    current.alasanTidakAktif === AlasanTidakAktif.MENINGGAL
  ) {
    throw new AppError("Data Jemaat yang telah meninggal tidak dapat diubah.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  const allowNik = canReadNik(actor.peran);

  /*
   * Role tanpa izin membaca NIK
   * tidak boleh mengubah NIK melalui
   * request manual. Pertahankan nilai lama.
   */
  const nik = allowNik ? normalizeNik(input.nik) : current.nik;

  const nomorIndukGereja = normalizeNomorInduk(input.nomorIndukGereja);

  await assertRelations(input.unitGerejaId, input.wilayahId, input.keluargaId);

  await assertUniqueIdentifiers(nomorIndukGereja, nik, id);

  const inactiveData = getInactiveData(input);

  try {
    const jemaat = await prisma.jemaat.update({
      where: {
        id,
      },

      data: {
        nomorIndukGereja,
        nik,

        namaLengkap: input.namaLengkap.trim(),

        namaPanggilan: normalizeOptionalText(input.namaPanggilan),

        jenisKelamin: input.jenisKelamin,

        tempatLahir: normalizeOptionalText(input.tempatLahir),

        tanggalLahir: toDatabaseDate(input.tanggalLahir),

        alamat: normalizeOptionalText(input.alamat),

        noHp: normalizeOptionalText(input.noHp),

        email: normalizeOptionalText(input.email)?.toLowerCase() ?? null,

        foto: normalizeOptionalText(input.foto),

        status: input.status,

        ...inactiveData,

        unitGerejaId: input.unitGerejaId,

        wilayahId: input.wilayahId,

        keluargaId: input.keluargaId,
      },

      select: jemaatSelect,
    });

    return mapJemaat(jemaat, {
      allowNik: canReadNik(actor.peran),

      allowNomorKK: canReadNomorKK(actor.peran),
    });
  } catch (error) {
    throwIdentifierConflict(error);
  }
}

export async function deleteJemaat(actor: AppActor, id: string) {
  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,

      status: true,
      alasanTidakAktif: true,

      _count: {
        select: {
          pesertaEvent: true,
          baptisan: true,

          pernikahanPihakSatu: true,

          pernikahanPihakDua: true,
        },
      },

      profilPengguna: {
        select: {
          id: true,
        },
      },

      kematian: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!jemaat) {
    throw new AppError("Data jemaat tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (
    jemaat.status === StatusJemaat.TIDAK_AKTIF &&
    jemaat.alasanTidakAktif === AlasanTidakAktif.MENINGGAL
  ) {
    throw new AppError("Data Jemaat yang telah meninggal tidak dapat dihapus.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await assertCanAccessUnit(actor, jemaat.unitGerejaId);

  const relationCount =
    jemaat._count.pesertaEvent +
    jemaat._count.baptisan +
    jemaat._count.pernikahanPihakSatu +
    jemaat._count.pernikahanPihakDua +
    (jemaat.profilPengguna ? 1 : 0) +
    (jemaat.kematian ? 1 : 0);

  if (relationCount > 0) {
    throw new AppError(
      "Jemaat tidak dapat dihapus karena sudah mempunyai data terkait. Ubah status menjadi tidak aktif.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  await prisma.jemaat.update({
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
