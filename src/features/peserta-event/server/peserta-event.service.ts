import "server-only";

import { assertCanAccessUnit, type EventActor } from "@/features/event/server/event.service";
import {
  JenisPeserta,
  Prisma,
  StatusEvent,
  StatusJemaat,
  StatusPesertaEvent,
} from "@/generated/prisma/client";
import { AppError } from "@/lib/api/app-error";
import prisma from "@/lib/prisma";

import type {
  CreatePesertaEventInput,
  PesertaEventListItem,
  PesertaEventListParams,
  UpdatePesertaEventInput,
} from "../types";

const pesertaEventSelect = {
  id: true,
  eventId: true,

  jenisPeserta: true,

  jemaatId: true,
  pesertaUmumId: true,

  namaPesertaSnapshot: true,

  nomorAntrian: true,
  status: true,

  waktuTercatat: true,
  waktuCheckIn: true,
  waktuDipanggil: true,
  waktuSelesai: true,

  catatan: true,

  jemaat: {
    select: {
      nik: true,
      namaLengkap: true,
      jenisKelamin: true,
      tempatLahir: true,
      tanggalLahir: true,
      alamat: true,
      noHp: true,
      email: true,
    },
  },

  pesertaUmum: {
    select: {
      nik: true,
      namaLengkap: true,
      jenisKelamin: true,
      tempatLahir: true,
      tanggalLahir: true,
      alamat: true,
      noHp: true,
      email: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PesertaEventSelect;

type PesertaEventPayload = Prisma.PesertaEventGetPayload<{
  select: typeof pesertaEventSelect;
}>;

type EventRegistrationContext = {
  id: string;
  unitGerejaId: string;
  status: StatusEvent;
  kapasitas: number | null;
  gunakanPencatatanPeserta: boolean;
  gunakanCheckIn: boolean;
  gunakanAntrean: boolean;
  izinkanNonJemaat: boolean;
};

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function toDatabaseDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function mapPesertaEvent(peserta: PesertaEventPayload): PesertaEventListItem {
  const source =
    peserta.jenisPeserta === JenisPeserta.JEMAAT ? peserta.jemaat : peserta.pesertaUmum;

  if (!source) {
    throw new AppError("Sumber data peserta tidak ditemukan.", {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  return {
    id: peserta.id,
    eventId: peserta.eventId,

    jenisPeserta: peserta.jenisPeserta,

    jemaatId: peserta.jemaatId,
    pesertaUmumId: peserta.pesertaUmumId,

    namaPesertaSnapshot: peserta.namaPesertaSnapshot,

    nomorAntrian: peserta.nomorAntrian,

    status: peserta.status,

    waktuTercatat: peserta.waktuTercatat.toISOString(),

    waktuCheckIn: peserta.waktuCheckIn?.toISOString() ?? null,

    waktuDipanggil: peserta.waktuDipanggil?.toISOString() ?? null,

    waktuSelesai: peserta.waktuSelesai?.toISOString() ?? null,

    catatan: peserta.catatan,

    sumber: {
      nik: source.nik,
      namaLengkap: source.namaLengkap,
      jenisKelamin: source.jenisKelamin,
      tempatLahir: source.tempatLahir,
      tanggalLahir: toDateInput(source.tanggalLahir),
      alamat: source.alamat,
      noHp: source.noHp,
      email: source.email,
    },

    createdAt: peserta.createdAt.toISOString(),

    updatedAt: peserta.updatedAt.toISOString(),
  };
}

async function getEventRegistrationContext(
  actor: EventActor,
  eventId: string,
): Promise<EventRegistrationContext> {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      unitGerejaId: true,
      status: true,
      kapasitas: true,
      gunakanPencatatanPeserta: true,
      gunakanCheckIn: true,
      gunakanAntrean: true,
      izinkanNonJemaat: true,
    },
  });

  if (!event) {
    throw new AppError("Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await assertCanAccessUnit(actor, event.unitGerejaId);

  return event;
}

function assertRegistrationAvailable(event: EventRegistrationContext) {
  if (!event.gunakanPencatatanPeserta) {
    throw new AppError("Event ini tidak menggunakan pencatatan peserta.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (event.status !== StatusEvent.DIBUKA) {
    throw new AppError("Registrasi hanya dapat dilakukan ketika Event berstatus Dibuka.", {
      status: 409,
      code: "CONFLICT",
    });
  }
}

async function runSerializable<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const shouldRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < 3;

      if (shouldRetry) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Transaksi peserta gagal diproses.", {
    status: 409,
    code: "CONFLICT",
  });
}

async function assertCapacityAvailable(
  tx: Prisma.TransactionClient,
  event: EventRegistrationContext,
) {
  if (event.kapasitas === null) {
    return;
  }

  const participantCount = await tx.pesertaEvent.count({
    where: {
      eventId: event.id,
      deletedAt: null,

      status: {
        not: StatusPesertaEvent.BATAL,
      },
    },
  });

  if (participantCount >= event.kapasitas) {
    throw new AppError("Kapasitas Event sudah penuh.", {
      status: 409,
      code: "CONFLICT",
    });
  }
}

function getOrderBy(
  sortBy: PesertaEventListParams["sortBy"],
  sortOrder: PesertaEventListParams["sortOrder"],
): Prisma.PesertaEventOrderByWithRelationInput {
  switch (sortBy) {
    case "namaPesertaSnapshot":
      return {
        namaPesertaSnapshot: sortOrder,
      };

    case "nomorAntrian":
      return {
        nomorAntrian: sortOrder,
      };

    case "status":
      return {
        status: sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: sortOrder,
      };

    case "waktuTercatat":
    default:
      return {
        waktuTercatat: sortOrder,
      };
  }
}

export async function getPesertaEventList(
  actor: EventActor,
  eventId: string,
  params: PesertaEventListParams,
) {
  await getEventRegistrationContext(actor, eventId);

  const { q, page, pageSize, jenisPeserta, status, sortBy, sortOrder } = params;

  const where: Prisma.PesertaEventWhereInput = {
    eventId,
    deletedAt: null,

    ...(jenisPeserta
      ? {
          jenisPeserta,
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
              namaPesertaSnapshot: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              jemaat: {
                is: {
                  nik: {
                    contains: q,
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
              pesertaUmum: {
                is: {
                  nik: {
                    contains: q,
                  },
                },
              },
            },
            {
              pesertaUmum: {
                is: {
                  noHp: {
                    contains: q,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.pesertaEvent.findMany({
      where,
      select: pesertaEventSelect,

      orderBy: getOrderBy(sortBy, sortOrder),

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    prisma.pesertaEvent.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data.map(mapPesertaEvent),

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

export async function getJemaatEventOptions(actor: EventActor, eventId: string, q: string) {
  await getEventRegistrationContext(actor, eventId);

  return prisma.jemaat.findMany({
    where: {
      status: StatusJemaat.AKTIF,

      deletedAt: null,

      pesertaEvent: {
        none: {
          eventId,
          deletedAt: null,
        },
      },

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
                namaPanggilan: {
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
              {
                nik: {
                  contains: q,
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      nomorIndukGereja: true,
      nik: true,
      namaLengkap: true,

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
    },

    orderBy: {
      namaLengkap: "asc",
    },

    take: 20,
  });
}

export async function createPesertaEvent(
  actor: EventActor,
  eventId: string,
  input: CreatePesertaEventInput,
) {
  const context = await getEventRegistrationContext(actor, eventId);

  assertRegistrationAvailable(context);

  if (input.jenisPeserta === JenisPeserta.NON_JEMAAT && !context.izinkanNonJemaat) {
    throw new AppError("Event ini tidak mengizinkan peserta nonjemaat.", {
      status: 409,
      code: "CONFLICT",
      fieldErrors: {
        jenisPeserta: ["Pilih peserta Jemaat."],
      },
    });
  }

  try {
    const result = await runSerializable(async (tx) => {
      const event = await tx.event.findFirst({
        where: {
          id: eventId,
          deletedAt: null,
        },

        select: {
          id: true,
          unitGerejaId: true,
          status: true,
          kapasitas: true,
          gunakanPencatatanPeserta: true,
          gunakanCheckIn: true,
          gunakanAntrean: true,
          izinkanNonJemaat: true,
        },
      });

      if (!event) {
        throw new AppError("Event tidak ditemukan.", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      assertRegistrationAvailable(event);

      await assertCapacityAvailable(tx, event);

      if (input.jenisPeserta === JenisPeserta.JEMAAT) {
        const jemaat = await tx.jemaat.findFirst({
          where: {
            id: input.jemaatId,
            status: StatusJemaat.AKTIF,
            deletedAt: null,
          },

          select: {
            id: true,
            namaLengkap: true,
          },
        });

        if (!jemaat) {
          throw new AppError("Jemaat tidak ditemukan atau tidak aktif.", {
            status: 422,
            code: "VALIDATION_ERROR",
            fieldErrors: {
              jemaatId: ["Pilih Jemaat aktif."],
            },
          });
        }

        const existing = await tx.pesertaEvent.findFirst({
          where: {
            eventId,
            jemaatId: jemaat.id,
          },

          select: {
            id: true,
            deletedAt: true,
          },
        });

        if (existing && !existing.deletedAt) {
          throw new AppError("Jemaat sudah terdaftar pada Event ini.", {
            status: 409,
            code: "CONFLICT",
            fieldErrors: {
              jemaatId: ["Jemaat sudah terdaftar."],
            },
          });
        }

        if (existing?.deletedAt) {
          return tx.pesertaEvent.update({
            where: {
              id: existing.id,
            },

            data: {
              jenisPeserta: JenisPeserta.JEMAAT,

              jemaatId: jemaat.id,

              pesertaUmumId: null,

              namaPesertaSnapshot: jemaat.namaLengkap,

              nomorAntrian: null,

              status: StatusPesertaEvent.TERCATAT,

              waktuTercatat: new Date(),

              waktuCheckIn: null,

              waktuDipanggil: null,

              waktuSelesai: null,

              catatan: normalizeOptionalText(input.catatan),

              deletedAt: null,
            },

            select: pesertaEventSelect,
          });
        }

        return tx.pesertaEvent.create({
          data: {
            eventId,

            jenisPeserta: JenisPeserta.JEMAAT,

            jemaatId: jemaat.id,

            namaPesertaSnapshot: jemaat.namaLengkap,

            catatan: normalizeOptionalText(input.catatan),
          },

          select: pesertaEventSelect,
        });
      }

      if (!event.izinkanNonJemaat) {
        throw new AppError("Event tidak mengizinkan peserta nonjemaat.", {
          status: 409,
          code: "CONFLICT",
        });
      }

      let pesertaUmum: {
        id: string;
        namaLengkap: string;
      } | null = null;

      if (input.nik) {
        const existingUmum = await tx.pesertaUmum.findUnique({
          where: {
            nik: input.nik,
          },

          select: {
            id: true,
          },
        });

        if (existingUmum) {
          pesertaUmum = await tx.pesertaUmum.update({
            where: {
              id: existingUmum.id,
            },

            data: {
              namaLengkap: input.namaLengkap.trim(),

              jenisKelamin: input.jenisKelamin,

              tempatLahir: normalizeOptionalText(input.tempatLahir),

              tanggalLahir: toDatabaseDate(input.tanggalLahir),

              alamat: normalizeOptionalText(input.alamat),

              noHp: normalizeOptionalText(input.noHp),

              email: normalizeOptionalText(input.email),

              keterangan: normalizeOptionalText(input.keterangan),

              deletedAt: null,
            },

            select: {
              id: true,
              namaLengkap: true,
            },
          });
        }
      }

      if (!pesertaUmum) {
        pesertaUmum = await tx.pesertaUmum.create({
          data: {
            nik: input.nik || null,

            namaLengkap: input.namaLengkap.trim(),

            jenisKelamin: input.jenisKelamin,

            tempatLahir: normalizeOptionalText(input.tempatLahir),

            tanggalLahir: toDatabaseDate(input.tanggalLahir),

            alamat: normalizeOptionalText(input.alamat),

            noHp: normalizeOptionalText(input.noHp),

            email: normalizeOptionalText(input.email),

            keterangan: normalizeOptionalText(input.keterangan),
          },

          select: {
            id: true,
            namaLengkap: true,
          },
        });
      }

      const existing = await tx.pesertaEvent.findFirst({
        where: {
          eventId,
          pesertaUmumId: pesertaUmum.id,
        },

        select: {
          id: true,
          deletedAt: true,
        },
      });

      if (existing && !existing.deletedAt) {
        throw new AppError("Peserta nonjemaat sudah terdaftar pada Event ini.", {
          status: 409,
          code: "CONFLICT",
          fieldErrors: {
            nik: ["Peserta sudah terdaftar."],
          },
        });
      }

      if (existing?.deletedAt) {
        return tx.pesertaEvent.update({
          where: {
            id: existing.id,
          },

          data: {
            jenisPeserta: JenisPeserta.NON_JEMAAT,

            jemaatId: null,

            pesertaUmumId: pesertaUmum.id,

            namaPesertaSnapshot: pesertaUmum.namaLengkap,

            nomorAntrian: null,

            status: StatusPesertaEvent.TERCATAT,

            waktuTercatat: new Date(),

            waktuCheckIn: null,

            waktuDipanggil: null,

            waktuSelesai: null,

            catatan: normalizeOptionalText(input.catatan),

            deletedAt: null,
          },

          select: pesertaEventSelect,
        });
      }

      return tx.pesertaEvent.create({
        data: {
          eventId,

          jenisPeserta: JenisPeserta.NON_JEMAAT,

          pesertaUmumId: pesertaUmum.id,

          namaPesertaSnapshot: pesertaUmum.namaLengkap,

          catatan: normalizeOptionalText(input.catatan),
        },

        select: pesertaEventSelect,
      });
    });

    return mapPesertaEvent(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Peserta atau NIK sudah terdaftar.", {
        status: 409,
        code: "CONFLICT",
      });
    }

    throw error;
  }
}

export async function updatePesertaEvent(
  actor: EventActor,
  eventId: string,
  pesertaId: string,
  input: UpdatePesertaEventInput,
) {
  await getEventRegistrationContext(actor, eventId);

  const current = await prisma.pesertaEvent.findFirst({
    where: {
      id: pesertaId,
      eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      jenisPeserta: true,
      pesertaUmumId: true,
      status: true,
    },
  });

  if (!current) {
    throw new AppError("Peserta Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (current.jenisPeserta !== input.jenisPeserta) {
    throw new AppError("Jenis peserta tidak dapat diubah.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  if (
    current.status === StatusPesertaEvent.SELESAI ||
    current.status === StatusPesertaEvent.BATAL
  ) {
    throw new AppError("Data peserta yang sudah selesai atau batal tidak dapat diubah.", {
      status: 409,
      code: "CONFLICT",
    });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (current.jenisPeserta === JenisPeserta.NON_JEMAAT) {
        if (!current.pesertaUmumId) {
          throw new AppError("Data peserta umum tidak ditemukan.", {
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        await tx.pesertaUmum.update({
          where: {
            id: current.pesertaUmumId,
          },

          data: {
            nik: input.nik || null,

            namaLengkap: input.namaLengkap.trim(),

            jenisKelamin: input.jenisKelamin,

            tempatLahir: normalizeOptionalText(input.tempatLahir),

            tanggalLahir: toDatabaseDate(input.tanggalLahir),

            alamat: normalizeOptionalText(input.alamat),

            noHp: normalizeOptionalText(input.noHp),

            email: normalizeOptionalText(input.email),

            keterangan: normalizeOptionalText(input.keterangan),
          },
        });
      }

      return tx.pesertaEvent.update({
        where: {
          id: pesertaId,
        },

        data: {
          ...(current.jenisPeserta === JenisPeserta.NON_JEMAAT
            ? {
                namaPesertaSnapshot: input.namaLengkap.trim(),
              }
            : {}),

          catatan: normalizeOptionalText(input.catatan),
        },

        select: pesertaEventSelect,
      });
    });

    return mapPesertaEvent(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("NIK sudah digunakan peserta lain.", {
        status: 409,
        code: "CONFLICT",
        fieldErrors: {
          nik: ["NIK sudah digunakan peserta lain."],
        },
      });
    }

    throw error;
  }
}

export async function deletePesertaEvent(actor: EventActor, eventId: string, pesertaId: string) {
  await getEventRegistrationContext(actor, eventId);

  const peserta = await prisma.pesertaEvent.findFirst({
    where: {
      id: pesertaId,
      eventId,
      deletedAt: null,
    },

    select: {
      id: true,
      status: true,
      nomorAntrian: true,
      waktuCheckIn: true,
      waktuDipanggil: true,
      waktuSelesai: true,
    },
  });

  if (!peserta) {
    throw new AppError("Peserta Event tidak ditemukan.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const alreadyOperational =
    peserta.status !== StatusPesertaEvent.TERCATAT ||
    peserta.nomorAntrian !== null ||
    peserta.waktuCheckIn !== null ||
    peserta.waktuDipanggil !== null ||
    peserta.waktuSelesai !== null;

  if (alreadyOperational) {
    throw new AppError(
      "Peserta yang sudah menjalani proses operasional tidak dapat dihapus. Gunakan tindakan batal pada modul check-in.",
      {
        status: 409,
        code: "CONFLICT",
      },
    );
  }

  await prisma.pesertaEvent.update({
    where: {
      id: pesertaId,
    },

    data: {
      deletedAt: new Date(),
    },
  });

  return {
    id: pesertaId,
  };
}
