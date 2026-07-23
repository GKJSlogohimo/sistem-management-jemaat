import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { getDashboardSummary } from "@/features/dashboard/server/dashboard.service";
import { DASHBOARD_READ_ROLES } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export default async function DashboardPage() {
  const authActor = await requirePageRoles(DASHBOARD_READ_ROLES);

  const actor: AppActor = {
    userId: authActor.session.user.id,
    peran: authActor.profile.peran,
    unitGerejaId: authActor.profile.unitGerejaId,
  };

  const summary = await getDashboardSummary(actor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <p className="text-sm text-muted-foreground">
          Ringkasan data Jemaat dan pencatatan pelayanan gereja.
        </p>
      </div>

      <DashboardSummary summary={summary} />
    </div>
  );
}
