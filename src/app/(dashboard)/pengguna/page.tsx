import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { PenggunaTable } from "@/features/pengguna/components/pengguna-table";

export const metadata: Metadata = {
  title: "Manajemen Pengguna | Sistem Manajemen Jemaat",
};

export default function PenggunaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen Pengguna</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akun, role, status, dan cakupan akses pengguna.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-120 w-full" />}>
        <PenggunaTable />
      </Suspense>
    </div>
  );
}
