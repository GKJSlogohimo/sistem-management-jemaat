import type { Metadata } from "next";

import { EventWorkspace } from "@/features/event/components/event-workspace";
import {
  EVENT_READ_ROLES,
  EVENT_WRITE_ROLES,
  hasAnyRole,
  OPERASIONAL_EVENT_READ_ROLES,
} from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export const metadata: Metadata = {
  title: "Detail Event | Sistem Manajemen Jemaat",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  const actor = await requirePageRoles(EVENT_READ_ROLES);

  return (
    <EventWorkspace
      eventId={id}
      permissions={{
        canManageEvent: hasAnyRole(actor.profile.peran, EVENT_WRITE_ROLES),

        canOpenOperasional: hasAnyRole(actor.profile.peran, OPERASIONAL_EVENT_READ_ROLES),
      }}
    />
  );
}
