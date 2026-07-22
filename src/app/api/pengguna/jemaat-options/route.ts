import { jemaatPenggunaOptionsQuerySchema } from "@/features/pengguna/schemas/pengguna.schema";
import { getJemaatPenggunaOptions } from "@/features/pengguna/server/pengguna.service";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { PENGGUNA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_WRITE_ROLES);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = jemaatPenggunaOptionsQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const data = await getJemaatPenggunaOptions(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data.unitGerejaId,
      parsed.data.userId,
    );

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
