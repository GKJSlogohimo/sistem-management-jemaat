import { z } from "zod";

import { getKeluargaOptions } from "@/features/keluarga/server/keluarga.service";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

const querySchema = z.object({
  unitGerejaId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    await requireActiveProfile(request.headers);

    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = querySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const options = await getKeluargaOptions(parsed.data.unitGerejaId);

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
