import { z } from "zod";

import { getWilayahOptions } from "@/features/wilayah/server/wilayah.service";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { WILAYAH_READ_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

const querySchema = z.object({
  unitGerejaId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, WILAYAH_READ_ROLES);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const options = await getWilayahOptions(parsed.data.unitGerejaId);

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
