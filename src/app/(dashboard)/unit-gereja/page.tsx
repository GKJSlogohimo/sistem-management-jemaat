import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { UnitGerejaTable } from "@/features/unit-gereja/components/unit-gereja-table";

export const metadata: Metadata = {
  title: "Unit Gereja | Sistem Manajemen Jemaat",
};

function UnitGerejaTableFallback() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-40" />
      </div>

      <Skeleton className="h-105 w-full" />
    </div>
  );
}

export default function UnitGerejaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Unit Gereja</h1>

        <p className="mt-1 text-sm text-muted-foreground">Kelola gereja induk dan tiga subinduk.</p>
      </div>

      <Suspense fallback={<UnitGerejaTableFallback />}>
        <UnitGerejaTable />
      </Suspense>
    </div>
  );
}
