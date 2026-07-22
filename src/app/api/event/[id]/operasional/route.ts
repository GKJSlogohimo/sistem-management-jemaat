import { publishEventChanged, publishQueueCalled } from "@/app/api/realtime/ably-server";
import { eventIdSchema } from "@/features/event/schemas/event.schema";
import { getOperasionalActionRoles } from "@/features/operasional-event/permissions";
import {
  type OperasionalEventAction,
  operasionalEventActionSchema,
  operasionalEventQuerySchema,
} from "@/features/operasional-event/schemas/operasional-event.schema";
import {
  executeOperasionalEventAction,
  getOperasionalEventState,
} from "@/features/operasional-event/server/operasional-event.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { OPERASIONAL_EVENT_READ_ROLES } from "@/lib/auth/access-roles";
import { assertHasAnyRole } from "@/lib/auth/assert-role";
import { requireActiveProfile } from "@/lib/auth/require-profile";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getActor(result: Awaited<ReturnType<typeof requireActiveProfile>>) {
  return {
    userId: result.session.user.id,

    peran: result.profile.peran,

    unitGerejaId: result.profile.unitGerejaId,
  };
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireActiveProfile(request.headers);
    assertHasAnyRole(actor.profile.peran, OPERASIONAL_EVENT_READ_ROLES);
    const { id } = await params;

    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsedQuery = operasionalEventQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiValidationError(parsedQuery.error);
    }

    const state = await getOperasionalEventState(
      getActor(actor),
      parsedId.data,
      parsedQuery.data.q,
    );

    return apiSuccess(state);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const { id } = await params;

    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = operasionalEventActionSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    assertHasAnyRole(actor.profile.peran, getOperasionalActionRoles(parsed.data.action));

    const result = await executeOperasionalEventAction(getActor(actor), parsedId.data, parsed.data);

    await publishEventChanged(parsedId.data, parsed.data.action);

    if (parsed.data.action === "PANGGIL" || parsed.data.action === "PANGGIL_BERIKUTNYA") {
      if (result.nomorAntrian !== null) {
        await publishQueueCalled({
          eventId: parsedId.data,

          pesertaId: result.id,

          nomorAntrian: result.nomorAntrian,

          tujuan: "meja pelayanan",
        });
      }
    }

    return apiSuccess(result, {
      message: getActionMessage(parsed.data.action),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function getActionMessage(action: OperasionalEventAction) {
  switch (action) {
    case "CHECK_IN":
      return "Peserta berhasil check-in.";

    case "PANGGIL":
    case "PANGGIL_BERIKUTNYA":
      return "Peserta berhasil dipanggil.";

    case "KEMBALIKAN":
      return "Peserta dikembalikan ke antrean.";

    case "SELESAI":
      return "Pelayanan peserta berhasil diselesaikan.";

    case "BATAL":
      return "Peserta berhasil dibatalkan.";
  }
}
