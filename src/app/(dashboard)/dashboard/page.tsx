import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { DASHBOARD_READ_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export default async function DashboardPage() {
  await requirePageRoles(DASHBOARD_READ_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <p className="text-sm text-muted-foreground">
          Ringkasan data Jemaat dan pencatatan pelayanan gereja.
        </p>
      </div>

      <DashboardSummary />
    </div>
  );
}
