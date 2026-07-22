import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { WilayahTable } from "@/features/wilayah/components/wilayah-table";
import { hasAnyRole, WILAYAH_READ_ROLES, WILAYAH_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export const metadata: Metadata = {
  title: "Wilayah | Sistem Manajemen Jemaat",
};

function WilayahTableFallback() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-60" />
        </div>

        <Skeleton className="h-9 w-40" />
      </div>

      <Skeleton className="h-105 w-full" />
    </div>
  );
}

export default async function WilayahPage() {
  const actor = await requirePageRoles(WILAYAH_READ_ROLES);

  const canManage = hasAnyRole(actor.profile.peran, WILAYAH_WRITE_ROLES);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wilayah</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola pembagian wilayah jemaat pada setiap unit gereja.
        </p>
      </div>

      <Suspense fallback={<WilayahTableFallback />}>
        <WilayahTable canManage={canManage} />
      </Suspense>
    </div>
  );
}
