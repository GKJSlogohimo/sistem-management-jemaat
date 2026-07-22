import type { Metadata } from "next";

import { LaporanEventWorkspace } from "@/features/laporan-event/components/laporan-event-workspace";
import { canReadNik, EVENT_READ_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

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

  const actor = await requirePageRoles(EVENT_READ_ROLES);

  return <LaporanEventWorkspace eventId={id} canViewNik={canReadNik(actor.profile.peran)} />;
}
