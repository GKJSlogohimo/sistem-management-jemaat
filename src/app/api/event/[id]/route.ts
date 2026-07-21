import { publishEventChanged } from "@/app/api/realtime/ably-server";
import { eventFormSchema, eventIdSchema } from "@/features/event/schemas/event.schema";
import { deleteEvent, getEventById, updateEvent } from "@/features/event/server/event.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

const eventManagerRoles = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.PANITIA_EVENT,
];

type EventRouteProps = {
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

export async function GET(request: Request, { params }: EventRouteProps) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const { id } = await params;
    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    return apiSuccess(await getEventById(getActor(actor), parsedId.data));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: EventRouteProps) {
  try {
    const actor = await requireRoles(request.headers, eventManagerRoles);

    const { id } = await params;
    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = eventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const event = await updateEvent(getActor(actor), parsedId.data, parsed.data);

    await publishEventChanged(parsedId.data, "EVENT_DIPERBARUI");

    return apiSuccess(event, {
      message: "Event berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: EventRouteProps) {
  try {
    const actor = await requireRoles(request.headers, eventManagerRoles);

    const { id } = await params;
    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteEvent(getActor(actor), parsedId.data);

    return apiSuccess(result, {
      message: "Event berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
