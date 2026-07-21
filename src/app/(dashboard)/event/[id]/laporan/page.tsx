import type { Metadata } from "next";

import { LaporanEventWorkspace } from "@/features/laporan-event/components/laporan-event-workspace";

export const metadata: Metadata = {
  title: "Laporan Event | Sistem Manajemen Jemaat",
};

type LaporanEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LaporanEventPage({ params }: LaporanEventPageProps) {
  const { id } = await params;

  return <LaporanEventWorkspace eventId={id} />;
}
