import { KematianTable } from "@/features/kematian/components/kematian-table";
import { hasAnyRole, KEMATIAN_READ_ROLES, KEMATIAN_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export default async function KematianPage() {
  const actor = await requirePageRoles(KEMATIAN_READ_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kematian</h1>

        <p className="text-sm text-muted-foreground">
          Kelola pencatatan kematian, pelayanan penghiburan, dan pemakaman Jemaat.
        </p>
      </div>

      <KematianTable canManage={hasAnyRole(actor.profile.peran, KEMATIAN_WRITE_ROLES)} />
    </div>
  );
}
