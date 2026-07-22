import { z } from "zod";

import { getKeluargaOptions } from "@/features/keluarga/server/keluarga.service";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KELUARGA_READ_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

const querySchema = z.object({
  unitGerejaId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, KELUARGA_READ_ROLES);

    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = querySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const options = await getKeluargaOptions(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data.unitGerejaId,
    );

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
