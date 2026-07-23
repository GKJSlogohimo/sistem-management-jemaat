import { jemaatKematianOptionsQuerySchema } from "@/features/kematian/schemas/kematian.schema";
import { getJemaatKematianOptions } from "@/features/kematian/server/kematian.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KEMATIAN_WRITE_ROLES } from "@/lib/auth/access-roles";
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
    const authActor = await requireApiRoles(request.headers, KEMATIAN_WRITE_ROLES);

    const url = new URL(request.url);

    const params = jemaatKematianOptionsQuerySchema.parse(
      Object.fromEntries(url.searchParams.entries()),
    );

    const result = await getJemaatKematianOptions(createActor(authActor), params);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
