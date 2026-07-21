import "server-only";

import { isAPIError } from "better-auth/api";

import {
  JenisUnitGereja,
  PeranPengguna,
  type Prisma,
  StatusJemaat,
} from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import { authProvisioning } from "@/lib/auth-provisioning";
import prisma from "@/lib/prisma";

import type {
  CreatePenggunaInput,
  PenggunaListItem,
  PenggunaListParams,
  UpdatePenggunaInput,
} from "../types";

const penggunaSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,

  profil: {
    select: {
      id: true,
      peran: true,
      aktif: true,
      unitGerejaId: true,
      jemaatId: true,

      unitGereja: {
        select: {
          id: true,
          kode: true,
          nama: true,
          jenis: true,
        },
      },

      jemaat: {
        select: {
          id: true,
          nomorIndukGereja: true,
          namaLengkap: true,
        },
      },
    },
  },

  _count: {
    select: {
      sessions: {
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type PenggunaPayload = Prisma.UserGetPayload<{
  select: typeof penggunaSelect;
}>;

function mapPengguna(user: PenggunaPayload): PenggunaListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,

    profilId: user.profil?.id ?? null,
    peran: user.profil?.peran ?? null,
    aktif: user.profil?.aktif ?? false,
    terkonfigurasi: Boolean(user.profil),

    unitGerejaId: user.profil?.unitGerejaId ?? null,

    jemaatId: user.profil?.jemaatId ?? null,

    unitGereja: user.profil?.unitGereja ?? null,

    jemaat: user.profil?.jemaat ?? null,

    jumlahSesiAktif: user._count.sessions,

    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function assertProfileScope(
  input: {
    peran: PeranPengguna;
    unitGerejaId: string | null;
    jemaatId: string | null;
  },
  targetUserId?: string,
) {
  const { peran, unitGerejaId, jemaatId } = input;

  if (peran === PeranPengguna.SUPER_ADMIN) {
    if (unitGerejaId || jemaatId) {
      throw new AppError("Super Admin tidak dibatasi pada Unit Gereja atau Jemaat tertentu.", {
        status: 422,
        code: "VALIDATION_ERROR",
        fieldErrors: {
          unitGerejaId: ["Kosongkan Unit Gereja untuk Super Admin."],
          jemaatId: ["Kosongkan Jemaat untuk Super Admin."],
        },
      });
    }

    return;
  }

  if (!unitGerejaId) {
    throw new AppError("Unit Gereja wajib dipilih.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        unitGerejaId: ["Unit Gereja wajib dipilih untuk role ini."],
      },
    });
  }

  const unit = await prisma.unitGereja.findFirst({
    where: {
      id: unitGerejaId,
      aktif: true,
      deletedAt: null,
    },
    select: {
      id: true,
      jenis: true,
    },
  });

  if (!unit) {
    throw new AppError("Unit Gereja tidak ditemukan atau tidak aktif.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        unitGerejaId: ["Pilih Unit Gereja yang masih aktif."],
      },
    });
  }

  if (peran === PeranPengguna.ADMIN_INDUK && unit.jenis !== JenisUnitGereja.INDUK) {
    throw new AppError("Admin Induk harus terhubung ke Unit Gereja induk.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        unitGerejaId: ["Pilih Unit Gereja dengan jenis Induk."],
      },
    });
  }

  if (peran === PeranPengguna.ADMIN_SUB_INDUK && unit.jenis !== JenisUnitGereja.SUB_INDUK) {
    throw new AppError("Admin Subinduk harus terhubung ke Unit Gereja subinduk.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        unitGerejaId: ["Pilih Unit Gereja dengan jenis Subinduk."],
      },
    });
  }

  if (!jemaatId) {
    return;
  }

  const jemaat = await prisma.jemaat.findFirst({
    where: {
      id: jemaatId,
      unitGerejaId,
      status: StatusJemaat.AKTIF,
      deletedAt: null,

      OR: [
        {
          profilPengguna: {
            is: null,
          },
        },
        ...(targetUserId
          ? [
              {
                profilPengguna: {
                  is: {
                    userId: targetUserId,
                  },
                },
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
    },
  });

  if (!jemaat) {
    throw new AppError("Jemaat tidak tersedia atau sudah terhubung ke akun lain.", {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        jemaatId: ["Pilih jemaat aktif yang belum terhubung ke akun lain."],
      },
    });
  }
}

function getOrderBy(
  sortBy: PenggunaListParams["sortBy"],
  sortOrder: PenggunaListParams["sortOrder"],
): Prisma.UserOrderByWithRelationInput {
  switch (sortBy) {
    case "email":
      return {
        email: sortOrder,
      };

    case "peran":
      return {
        profil: {
          peran: sortOrder,
        },
      };

    case "createdAt":
      return {
        createdAt: sortOrder,
      };

    case "name":
    default:
      return {
        name: sortOrder,
      };
  }
}

export async function getPenggunaList(params: PenggunaListParams) {
  const { q, page, pageSize, peran, aktif, unitGerejaId, sortBy, sortOrder } = params;

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              profil: {
                is: {
                  jemaat: {
                    is: {
                      namaLengkap: {
                        contains: q,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),

    ...(peran || aktif !== undefined || unitGerejaId
      ? {
          profil: {
            is: {
              ...(peran
                ? {
                    peran,
                  }
                : {}),

              ...(aktif !== undefined
                ? {
                    aktif,
                  }
                : {}),

              ...(unitGerejaId
                ? {
                    unitGerejaId,
                  }
                : {}),
            },
          },
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: penggunaSelect,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.user.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapPengguna),

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

export async function getPenggunaById(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: penggunaSelect,
  });

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapPengguna(user);
}

export async function createPengguna(input: CreatePenggunaInput) {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new AppError("Email sudah terdaftar.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        email: ["Email sudah terdaftar."],
      },
    });
  }

  await assertProfileScope({
    peran: input.peran,
    unitGerejaId: input.unitGerejaId,
    jemaatId: input.jemaatId,
  });

  let createdUserId: string | null = null;

  try {
    const result = await authProvisioning.api.signUpEmail({
      body: {
        name: input.name.trim(),
        email,
        password: input.password,
      },
    });

    createdUserId = result.user.id;

    await prisma.profilPengguna.create({
      data: {
        userId: createdUserId,
        peran: input.peran,
        aktif: input.aktif,
        unitGerejaId: input.unitGerejaId,
        jemaatId: input.jemaatId,
      },
    });

    return getPenggunaById(createdUserId);
  } catch (error) {
    if (createdUserId) {
      await prisma.user
        .delete({
          where: {
            id: createdUserId,
          },
        })
        .catch(() => undefined);
    }

    if (error instanceof AppError) {
      throw error;
    }

    if (isAPIError(error)) {
      const apiError = error as {
        message: string;
        body?: {
          code?: unknown;
        };
      };

      const code = typeof apiError.body?.code === "string" ? apiError.body.code : "";

      if (code === "USER_ALREADY_EXISTS") {
        throw new AppError("Email sudah terdaftar.", {
          status: 409,
          code: "CONFLICT",
          fieldErrors: {
            email: ["Email sudah terdaftar."],
          },
        });
      }

      throw new AppError(apiError.message || "Akun pengguna tidak dapat dibuat.", {
        status: 400,
        code: "BAD_REQUEST",
      });
    }

    throw error;
  }
}

async function assertLastSuperAdmin(
  target: {
    peran: PeranPengguna;
    aktif: boolean;
  },
  next: {
    peran: PeranPengguna;
    aktif: boolean;
  },
) {
  const removesActiveSuperAdmin =
    target.peran === PeranPengguna.SUPER_ADMIN &&
    target.aktif &&
    (next.peran !== PeranPengguna.SUPER_ADMIN || !next.aktif);

  if (!removesActiveSuperAdmin) {
    return;
  }

  const activeSuperAdminCount = await prisma.profilPengguna.count({
    where: {
      peran: PeranPengguna.SUPER_ADMIN,
      aktif: true,
    },
  });

  if (activeSuperAdminCount <= 1) {
    throw new AppError("SUPER_ADMIN terakhir tidak dapat diturunkan atau dinonaktifkan.", {
      status: 409,
      code: "CONFLICT",
    });
  }
}

export async function updatePengguna(id: string, actorUserId: string, input: UpdatePenggunaInput) {
  const current = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      profil: {
        select: {
          peran: true,
          aktif: true,
        },
      },
    },
  });

  if (!current) {
    throw new AppError("Pengguna tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const currentRole = current.profil?.peran ?? PeranPengguna.VIEWER;

  const currentActive = current.profil?.aktif ?? false;

  if (id === actorUserId && (input.peran !== currentRole || !input.aktif)) {
    throw new AppError("Anda tidak dapat mengubah role atau menonaktifkan akun sendiri.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  await assertLastSuperAdmin(
    {
      peran: currentRole,
      aktif: currentActive,
    },
    {
      peran: input.peran,
      aktif: input.aktif,
    },
  );

  await assertProfileScope(
    {
      peran: input.peran,
      unitGerejaId: input.unitGerejaId,
      jemaatId: input.jemaatId,
    },
    id,
  );

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id,
      },
      data: {
        name: input.name.trim(),
      },
    });

    await tx.profilPengguna.upsert({
      where: {
        userId: id,
      },
      create: {
        userId: id,
        peran: input.peran,
        aktif: input.aktif,
        unitGerejaId: input.unitGerejaId,
        jemaatId: input.jemaatId,
      },
      update: {
        peran: input.peran,
        aktif: input.aktif,
        unitGerejaId: input.unitGerejaId,
        jemaatId: input.jemaatId,
      },
    });

    if (!input.aktif) {
      await tx.session.deleteMany({
        where: {
          userId: id,
        },
      });
    }
  });

  return getPenggunaById(id);
}

export async function deactivatePengguna(id: string, actorUserId: string) {
  if (id === actorUserId) {
    throw new AppError("Anda tidak dapat menonaktifkan akun sendiri.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  const current = await prisma.profilPengguna.findUnique({
    where: {
      userId: id,
    },
    select: {
      peran: true,
      aktif: true,
    },
  });

  if (!current) {
    throw new AppError("Profil pengguna belum dikonfigurasi.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertLastSuperAdmin(current, {
    peran: current.peran,
    aktif: false,
  });

  await prisma.$transaction([
    prisma.profilPengguna.update({
      where: {
        userId: id,
      },
      data: {
        aktif: false,
      },
    }),

    prisma.session.deleteMany({
      where: {
        userId: id,
      },
    }),
  ]);

  return {
    id,
  };
}

export async function getJemaatPenggunaOptions(unitGerejaId: string, userId?: string) {
  return prisma.jemaat.findMany({
    where: {
      unitGerejaId,
      status: StatusJemaat.AKTIF,
      deletedAt: null,

      OR: [
        {
          profilPengguna: {
            is: null,
          },
        },
        ...(userId
          ? [
              {
                profilPengguna: {
                  is: {
                    userId,
                  },
                },
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
    },

    orderBy: {
      namaLengkap: "asc",
    },
  });
}
