import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { KategoriEventTable } from "@/features/kategori-event/components/kategori-event-table";

export const metadata: Metadata = {
  title: "Kategori Event | Sistem Manajemen Jemaat",
};

function KategoriEventTableFallback() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-44" />
        </div>

        <Skeleton className="h-9 w-44" />
      </div>

      <Skeleton className="h-105 w-full" />
    </div>
  );
}

export default function KategoriEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kategori Event</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola kategori, ikon, warna, dan status yang digunakan pada Event.
        </p>
      </div>

      <Suspense fallback={<KategoriEventTableFallback />}>
        <KategoriEventTable />
      </Suspense>
    </div>
  );
}
