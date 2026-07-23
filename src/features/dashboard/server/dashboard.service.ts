import "server-only";

import { getAccessibleUnitIds } from "@/features/event/server/event.service";
import { JenisKelamin, StatusJemaat, StatusPencatatanKematian } from "@/generated/prisma/client";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

import type { DashboardRecentActivity, DashboardSummary } from "../types";

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getBaptisanLabel(value: string) {
  switch (value) {
    case "BAPTIS_ANAK":
      return "Baptis Anak";

    case "BAPTIS_DEWASA":
      return "Baptis Dewasa";

    case "SIDI":
      return "Sidi";

    default:
      return "Baptisan";
  }
}

export async function getDashboardSummary(actor: AppActor): Promise<DashboardSummary> {
  const accessibleUnitIds = await getAccessibleUnitIds(actor);

  const currentYear = new Date().getUTCFullYear();

  const startOfYear = new Date(Date.UTC(currentYear, 0, 1));

  const startOfNextYear = new Date(Date.UTC(currentYear + 1, 0, 1));

  const unitScope = {
    unitGerejaId: {
      in: accessibleUnitIds,
    },
  };

  const [
    totalUnitGereja,
    totalWilayah,
    totalKeluarga,
    totalJemaat,
    jemaatAktif,
    jemaatTidakAktif,
    jemaatLakiLaki,
    jemaatPerempuan,
    baptisanTahunIni,
    pernikahanTahunIni,
    kematianTahunIni,
    recentBaptisan,
    recentPernikahan,
    recentKematian,
  ] = await Promise.all([
    prisma.unitGereja.count({
      where: {
        id: {
          in: accessibleUnitIds,
        },
        aktif: true,
      },
    }),

    prisma.wilayah.count({
      where: {
        ...unitScope,
        deletedAt: null,
      },
    }),

    prisma.keluarga.count({
      where: {
        ...unitScope,
        deletedAt: null,
      },
    }),

    prisma.jemaat.count({
      where: {
        ...unitScope,
        deletedAt: null,
      },
    }),

    prisma.jemaat.count({
      where: {
        ...unitScope,
        deletedAt: null,
        status: StatusJemaat.AKTIF,
      },
    }),

    prisma.jemaat.count({
      where: {
        ...unitScope,
        deletedAt: null,
        status: StatusJemaat.TIDAK_AKTIF,
      },
    }),

    prisma.jemaat.count({
      where: {
        ...unitScope,
        deletedAt: null,
        jenisKelamin: JenisKelamin.LAKI_LAKI,
      },
    }),

    prisma.jemaat.count({
      where: {
        ...unitScope,
        deletedAt: null,
        jenisKelamin: JenisKelamin.PEREMPUAN,
      },
    }),

    prisma.baptisan.count({
      where: {
        ...unitScope,
        deletedAt: null,
        tanggalBaptisan: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      },
    }),

    prisma.pernikahan.count({
      where: {
        ...unitScope,
        deletedAt: null,
        tanggalPernikahan: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      },
    }),

    prisma.kematian.count({
      where: {
        ...unitScope,
        deletedAt: null,
        status: StatusPencatatanKematian.TERVERIFIKASI,
        tanggalMeninggal: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      },
    }),

    prisma.baptisan.findMany({
      where: {
        ...unitScope,
        deletedAt: null,
      },
      select: {
        id: true,
        jenis: true,
        tanggalBaptisan: true,
        createdAt: true,
        jemaat: {
          select: {
            namaLengkap: true,
          },
        },
        unitGereja: {
          select: {
            kode: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.pernikahan.findMany({
      where: {
        ...unitScope,
        deletedAt: null,
      },
      select: {
        id: true,
        namaPihakSatu: true,
        namaPihakDua: true,
        tanggalPernikahan: true,
        createdAt: true,
        unitGereja: {
          select: {
            kode: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.kematian.findMany({
      where: {
        ...unitScope,
        deletedAt: null,
        status: StatusPencatatanKematian.TERVERIFIKASI,
      },
      select: {
        id: true,
        tanggalMeninggal: true,
        createdAt: true,
        jemaat: {
          select: {
            namaLengkap: true,
          },
        },
        unitGereja: {
          select: {
            kode: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  const recentActivities: DashboardRecentActivity[] = [
    ...recentBaptisan.map((item): DashboardRecentActivity => ({
      id: item.id,
      type: "BAPTISAN",
      title: item.jemaat.namaLengkap,
      description: `${getBaptisanLabel(item.jenis)} · ${item.unitGereja.kode} — ${item.unitGereja.nama}`,
      recordDate: toDateInput(item.tanggalBaptisan),
      createdAt: item.createdAt.toISOString(),
      href: "/baptisan",
    })),

    ...recentPernikahan.map((item): DashboardRecentActivity => ({
      id: item.id,
      type: "PERNIKAHAN",
      title: `${item.namaPihakSatu} & ${item.namaPihakDua}`,
      description: `Pernikahan · ${item.unitGereja.kode} — ${item.unitGereja.nama}`,
      recordDate: toDateInput(item.tanggalPernikahan),
      createdAt: item.createdAt.toISOString(),
      href: "/pernikahan",
    })),

    ...recentKematian.map((item): DashboardRecentActivity => ({
      id: item.id,
      type: "KEMATIAN",
      title: item.jemaat.namaLengkap,
      description: `Pencatatan kematian · ${item.unitGereja.kode} — ${item.unitGereja.nama}`,
      recordDate: toDateInput(item.tanggalMeninggal),
      createdAt: item.createdAt.toISOString(),
      href: "/kematian",
    })),
  ]
    .sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, 8);

  return {
    currentYear,

    totals: {
      unitGereja: totalUnitGereja,
      wilayah: totalWilayah,
      keluarga: totalKeluarga,
      jemaat: totalJemaat,
      jemaatAktif,
      jemaatTidakAktif,
    },

    gender: {
      lakiLaki: jemaatLakiLaki,
      perempuan: jemaatPerempuan,
    },

    currentYearRecords: {
      baptisan: baptisanTahunIni,
      pernikahan: pernikahanTahunIni,
      kematian: kematianTahunIni,
    },

    recentActivities,
  };
}
