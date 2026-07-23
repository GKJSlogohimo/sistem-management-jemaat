import { getDashboardSummary } from "@/features/dashboard/server/dashboard.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { DASHBOARD_READ_ROLES } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
import { requireApiRoles } from "@/lib/auth/require-api-role";

function createActor(authActor: Awaited<ReturnType<typeof requireApiRoles>>): AppActor {
  return {
    userId: authActor.session.user.id,
    peran: authActor.profile.peran,
    unitGerejaId: authActor.profile.unitGerejaId,
  };
}

export async function GET(request: Request) {
  try {
    const authActor = await requireApiRoles(request.headers, DASHBOARD_READ_ROLES);

    const result = await getDashboardSummary(createActor(authActor));

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
