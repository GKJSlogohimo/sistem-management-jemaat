import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EventTable } from "@/features/event/components/event-table";
import { EVENT_READ_ROLES, EVENT_WRITE_ROLES, hasAnyRole } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export const metadata: Metadata = {
  title: "Event | Sistem Manajemen Jemaat",
};

export default async function EventPage() {
  const actor = await requirePageRoles(EVENT_READ_ROLES);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola jadwal, kapasitas, peserta, check-in, dan antrean Event.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-125 w-full" />}>
        <EventTable canManage={hasAnyRole(actor.profile.peran, EVENT_WRITE_ROLES)} />
      </Suspense>
    </div>
  );
}
