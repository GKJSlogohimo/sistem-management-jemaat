import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { JemaatTable } from "@/features/jemaat/components/jemaat-table";
import { hasAnyRole, JEMAAT_READ_ROLES, JEMAAT_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export const metadata: Metadata = {
  title: "Jemaat | Sistem Manajemen Jemaat",
};

function TableFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-115 w-full" />
    </div>
  );
}

export default async function JemaatPage() {
  const actor = await requirePageRoles(JEMAAT_READ_ROLES);

  const canManage = hasAnyRole(actor.profile.peran, JEMAAT_WRITE_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jemaat</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola identitas, keluarga, wilayah, dan status keanggotaan jemaat.
        </p>
      </div>

      <Suspense fallback={<TableFallback />}>
        <JemaatTable canManage={canManage} />
      </Suspense>
    </div>
  );
}
