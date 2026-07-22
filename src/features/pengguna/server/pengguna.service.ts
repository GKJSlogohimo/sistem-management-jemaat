import "server-only";

import { isAPIError } from "better-auth/api";

import { assertCanAccessUnit, getAccessibleUnitIds } from "@/features/event/server/event.service";
import { JenisUnitGereja, PeranPengguna, Prisma, StatusJemaat } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import type { AppActor } from "@/lib/auth/actor";
import { authProvisioning } from "@/lib/auth-provisioning";
import prisma from "@/lib/prisma";

import type {
  CreatePenggunaInput,
  PenggunaListItem,
  PenggunaListParams,
  UpdatePenggunaInput,
} from "../types";
import { assertCanAssignUserRole } from "./pengguna-permission";

function createPenggunaSelect() {
  return {
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
            /*
             * new Date() dibuat pada setiap query,
             * bukan saat module pertama kali dimuat.
             */
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
}

type PenggunaSelect = ReturnType<typeof createPenggunaSelect>;

type PenggunaPayload = Prisma.UserGetPayload<{
  select: PenggunaSelect;
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

async function runSerializableTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const maximumAttempts = 3;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const shouldRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < maximumAttempts;

      if (!shouldRetry) {
        throw error;
      }
    }
  }

  throw new AppError("Transaksi pengguna tidak dapat diselesaikan.", {
    status: 409,
    code: "CONFLICT",
  });
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

async function createPenggunaScopeWhere(actor: AppActor): Promise<Prisma.UserWhereInput> {
  if (actor.peran === PeranPengguna.SUPER_ADMIN) {
    return {};
  }

  if (actor.peran !== PeranPengguna.ADMIN_INDUK) {
    throw new AppError("Anda tidak memiliki hak akses ke data pengguna.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  const accessibleUnitIds = await getAccessibleUnitIds(actor);

  return {
    profil: {
      is: {
        unitGerejaId: {
          in: accessibleUnitIds,
        },

        /*
         * Admin Induk tidak boleh melihat
         * profil Super Admin.
         */
        peran: {
          not: PeranPengguna.SUPER_ADMIN,
        },
      },
    },
  };
}

async function assertCanAccessTargetProfile(
  actor: AppActor,
  target: {
    peran: PeranPengguna;
    unitGerejaId: string | null;
  },
) {
  if (actor.peran === PeranPengguna.SUPER_ADMIN) {
    return;
  }

  assertCanAssignUserRole(actor.peran, target.peran);

  if (!target.unitGerejaId) {
    throw new AppError("Pengguna tanpa Unit Gereja hanya dapat dikelola oleh Super Admin.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  await assertCanAccessUnit(actor, target.unitGerejaId);
}

async function assertLastSuperAdmin(
  tx: Prisma.TransactionClient,
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

  const activeSuperAdminCount = await tx.profilPengguna.count({
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

export async function getPenggunaList(actor: AppActor, params: PenggunaListParams) {
  const { q, page, pageSize, peran, aktif, unitGerejaId, sortBy, sortOrder } = params;

  if (unitGerejaId) {
    await assertCanAccessUnit(actor, unitGerejaId);
  }

  const scopeWhere = await createPenggunaScopeWhere(actor);

  const filterWhere: Prisma.UserWhereInput = {
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

  const where: Prisma.UserWhereInput = {
    AND: [scopeWhere, filterWhere],
  };

  const penggunaSelect = createPenggunaSelect();

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

export async function getPenggunaById(actor: AppActor, id: string) {
  const scopeWhere = await createPenggunaScopeWhere(actor);

  const user = await prisma.user.findFirst({
    where: {
      AND: [
        {
          id,
        },
        scopeWhere,
      ],
    },

    select: createPenggunaSelect(),
  });

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan atau tidak berada dalam cakupan akses Anda.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return mapPengguna(user);
}

export async function createPengguna(actor: AppActor, input: CreatePenggunaInput) {
  const email = input.email.trim().toLowerCase();

  assertCanAssignUserRole(actor.peran, input.peran);

  if (input.unitGerejaId) {
    await assertCanAccessUnit(actor, input.unitGerejaId);
  }

  await assertProfileScope({
    peran: input.peran,
    unitGerejaId: input.unitGerejaId,
    jemaatId: input.jemaatId,
  });

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

    return getPenggunaById(actor, createdUserId);
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

export async function updatePengguna(actor: AppActor, id: string, input: UpdatePenggunaInput) {
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
          unitGerejaId: true,
          jemaatId: true,
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

  const currentUnitGerejaId = current.profil?.unitGerejaId ?? null;

  const currentJemaatId = current.profil?.jemaatId ?? null;

  const isCurrentUser = id === actor.userId;

  const changesSecurityProfile =
    input.peran !== currentRole ||
    input.aktif !== currentActive ||
    input.unitGerejaId !== currentUnitGerejaId ||
    input.jemaatId !== currentJemaatId;

  if (isCurrentUser && changesSecurityProfile) {
    throw new AppError(
      "Anda tidak dapat mengubah role, status, Unit Gereja, atau Jemaat akun sendiri.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  /*
   * Pengguna boleh memperbarui nama
   * akun sendiri. Pemeriksaan role target
   * hanya dilakukan saat mengelola orang lain.
   */
  if (!isCurrentUser) {
    await assertCanAccessTargetProfile(actor, {
      peran: currentRole,
      unitGerejaId: currentUnitGerejaId,
    });

    assertCanAssignUserRole(actor.peran, input.peran);
  }

  if (input.unitGerejaId) {
    await assertCanAccessUnit(actor, input.unitGerejaId);
  }

  await assertProfileScope(
    {
      peran: input.peran,
      unitGerejaId: input.unitGerejaId,
      jemaatId: input.jemaatId,
    },
    id,
  );

  await runSerializableTransaction(async (tx) => {
    await assertLastSuperAdmin(
      tx,
      {
        peran: currentRole,
        aktif: currentActive,
      },
      {
        peran: input.peran,
        aktif: input.aktif,
      },
    );

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

  return getPenggunaById(actor, id);
}

export async function deactivatePengguna(actor: AppActor, id: string) {
  if (id === actor.userId) {
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
      unitGerejaId: true,
    },
  });

  if (!current) {
    throw new AppError("Profil pengguna belum dikonfigurasi.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessTargetProfile(actor, {
    peran: current.peran,
    unitGerejaId: current.unitGerejaId,
  });

  /*
   * Tidak perlu melakukan update kembali
   * apabila pengguna sudah nonaktif.
   */
  if (!current.aktif) {
    return {
      id,
    };
  }

  await runSerializableTransaction(async (tx) => {
    await assertLastSuperAdmin(tx, current, {
      peran: current.peran,
      aktif: false,
    });

    await tx.profilPengguna.update({
      where: {
        userId: id,
      },

      data: {
        aktif: false,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: id,
      },
    });
  });

  return {
    id,
  };
}

export async function getJemaatPenggunaOptions(
  actor: AppActor,
  unitGerejaId: string,
  userId?: string,
) {
  await assertCanAccessUnit(actor, unitGerejaId);

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
