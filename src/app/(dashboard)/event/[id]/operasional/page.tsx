import type { Metadata } from "next";

import { OperasionalEventWorkspace } from "@/features/operasional-event/components/operasional-event-workspace";
import { getOperasionalCapabilities } from "@/features/operasional-event/permissions";
import { OPERASIONAL_EVENT_READ_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export const metadata: Metadata = {
  title: "Operasional Event | Sistem Manajemen Jemaat",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OperasionalEventPage({ params }: Props) {
  const { id } = await params;

  const actor = await requirePageRoles(OPERASIONAL_EVENT_READ_ROLES);

  return (
    <OperasionalEventWorkspace
      eventId={id}
      capabilities={getOperasionalCapabilities(actor.profile.peran)}
    />
  );
}
