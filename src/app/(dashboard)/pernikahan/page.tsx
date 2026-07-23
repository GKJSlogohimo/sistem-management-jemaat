import { PernikahanTable } from "@/features/pernikahan/components/pernikahan-table";
import { hasAnyRole, PERNIKAHAN_READ_ROLES, PERNIKAHAN_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requirePageRoles } from "@/lib/auth/require-page-role";

export default async function PernikahanPage() {
  const actor = await requirePageRoles(PERNIKAHAN_READ_ROLES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pernikahan</h1>

        <p className="text-sm text-muted-foreground">
          Kelola pencatatan pernikahan Jemaat dan pihak luar.
        </p>
      </div>

      <PernikahanTable canManage={hasAnyRole(actor.profile.peran, PERNIKAHAN_WRITE_ROLES)} />
    </div>
  );
}
