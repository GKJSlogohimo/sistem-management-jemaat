export type DashboardActivityType = "BAPTISAN" | "PERNIKAHAN" | "KEMATIAN";

export type DashboardRecentActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  recordDate: string;
  createdAt: string;
  href: string;
};

export type DashboardSummary = {
  currentYear: number;

  totals: {
    unitGereja: number;
    wilayah: number;
    keluarga: number;
    jemaat: number;
    jemaatAktif: number;
    jemaatTidakAktif: number;
  };

  gender: {
    lakiLaki: number;
    perempuan: number;
  };

  currentYearRecords: {
    baptisan: number;
    pernikahan: number;
    kematian: number;
  };

  recentActivities: DashboardRecentActivity[];
};
