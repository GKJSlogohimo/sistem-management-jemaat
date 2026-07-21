import { eventIdSchema } from "@/features/event/schemas/event.schema";
import { jemaatEventOptionsQuerySchema } from "@/features/peserta-event/schemas/peserta-event.schema";
import { getJemaatEventOptions } from "@/features/peserta-event/server/peserta-event.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const { id } = await params;

    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsedQuery = jemaatEventOptionsQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiValidationError(parsedQuery.error);
    }

    const options = await getJemaatEventOptions(
      {
        userId: actor.session.user.id,
        peran: actor.profile.peran,
        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
      parsedQuery.data.q,
    );

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
