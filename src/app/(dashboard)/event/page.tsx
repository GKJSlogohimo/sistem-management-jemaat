import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EventTable } from "@/features/event/components/event-table";

export const metadata: Metadata = {
  title: "Event | Sistem Manajemen Jemaat",
};

export default function EventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola jadwal, kapasitas, peserta, check-in, dan antrean Event.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-125 w-full" />}>
        <EventTable />
      </Suspense>
    </div>
  );
}
