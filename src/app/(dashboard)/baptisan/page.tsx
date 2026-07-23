import { BaptisanTable } from "@/features/baptisan/components/baptisan-table";
import { BAPTISAN_READ_ROLES, BAPTISAN_WRITE_ROLES, hasAnyRole } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export default async function BaptisanPage() {
  const actor = await requirePageRoles(BAPTISAN_READ_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Baptisan</h1>

        <p className="text-sm text-muted-foreground">
          Kelola pencatatan Baptis Anak, Baptis Dewasa, dan Sidi.
        </p>
      </div>

      <BaptisanTable canManage={hasAnyRole(actor.profile.peran, BAPTISAN_WRITE_ROLES)} />
    </div>
  );
}
