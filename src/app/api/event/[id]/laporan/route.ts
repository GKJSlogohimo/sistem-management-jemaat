import { z } from "zod";

import { getLaporanEvent } from "@/features/laporan-event/server/laporan-event.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const params = paramsSchema.parse(await context.params);

    const result = await getLaporanEvent(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      params.id,
    );

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
