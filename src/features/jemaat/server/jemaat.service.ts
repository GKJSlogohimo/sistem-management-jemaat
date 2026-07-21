import "server-only";

import { AlasanTidakAktif, Prisma, StatusJemaat } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
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

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized ? normalized : null;
}

function toDatabaseDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function mapJemaat(jemaat: JemaatPayload): JemaatListItem {
  return {
    ...jemaat,
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

    select: {
      nomorIndukGereja: true,
      nik: true,
      deletedAt: true,
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

function getInactiveData(input: CreateJemaatInput) {
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

export async function getJemaatList(params: JemaatListParams) {
  const { q, page, pageSize, unitGerejaId, wilayahId, jenisKelamin, status, sortBy, sortOrder } =
    params;

  const where: Prisma.JemaatWhereInput = {
    deletedAt: null,

    ...(unitGerejaId
      ? {
          unitGerejaId,
        }
      : {}),

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
          OR: [
            {
              nomorIndukGereja: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              nik: {
                contains: q,
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
          ],
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
    data: data.map(mapJemaat),

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

export async function getJemaatById(id: string) {
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

  return mapJemaat(jemaat);
}

export async function createJemaat(input: CreateJemaatInput) {
  const nomorIndukGereja = input.nomorIndukGereja.trim().toUpperCase();

  await assertRelations(input.unitGerejaId, input.wilayahId, input.keluargaId);

  await assertUniqueIdentifiers(nomorIndukGereja, input.nik);

  const inactiveData = getInactiveData(input);

  const jemaat = await prisma.jemaat.create({
    data: {
      nomorIndukGereja,
      nik: input.nik,
      namaLengkap: input.namaLengkap.trim(),
      namaPanggilan: normalizeOptionalText(input.namaPanggilan),
      jenisKelamin: input.jenisKelamin,
      tempatLahir: normalizeOptionalText(input.tempatLahir),
      tanggalLahir: toDatabaseDate(input.tanggalLahir),
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
      email: normalizeOptionalText(input.email),
      foto: normalizeOptionalText(input.foto),

      status: input.status,
      ...inactiveData,

      unitGerejaId: input.unitGerejaId,
      wilayahId: input.wilayahId,
      keluargaId: input.keluargaId,
    },

    select: jemaatSelect,
  });

  return mapJemaat(jemaat);
}

export async function updateJemaat(id: string, input: UpdateJemaatInput) {
  const current = await prisma.jemaat.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,
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

  if (current.kematian && !current.kematian.deletedAt && input.status === StatusJemaat.AKTIF) {
    throw new AppError(
      "Jemaat yang sudah mempunyai pencatatan kematian tidak dapat diaktifkan kembali.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  const nomorIndukGereja = input.nomorIndukGereja.trim().toUpperCase();

  await assertRelations(input.unitGerejaId, input.wilayahId, input.keluargaId);

  await assertUniqueIdentifiers(nomorIndukGereja, input.nik, id);

  const inactiveData = getInactiveData(input);

  const jemaat = await prisma.jemaat.update({
    where: {
      id,
    },

    data: {
      nomorIndukGereja,
      nik: input.nik,
      namaLengkap: input.namaLengkap.trim(),
      namaPanggilan: normalizeOptionalText(input.namaPanggilan),
      jenisKelamin: input.jenisKelamin,
      tempatLahir: normalizeOptionalText(input.tempatLahir),
      tanggalLahir: toDatabaseDate(input.tanggalLahir),
      alamat: normalizeOptionalText(input.alamat),
      noHp: normalizeOptionalText(input.noHp),
      email: normalizeOptionalText(input.email),
      foto: normalizeOptionalText(input.foto),

      status: input.status,
      ...inactiveData,

      unitGerejaId: input.unitGerejaId,
      wilayahId: input.wilayahId,
      keluargaId: input.keluargaId,
    },

    select: jemaatSelect,
  });

  return mapJemaat(jemaat);
}

export async function deleteJemaat(id: string) {
  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    select: {
      id: true,

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
