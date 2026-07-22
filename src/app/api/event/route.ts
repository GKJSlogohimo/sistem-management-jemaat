import { eventFormSchema, eventListQuerySchema } from "@/features/event/schemas/event.schema";
import { createEvent, getEventList } from "@/features/event/server/event.service";
import { PeranPengguna } from "@/generated/prisma/enums";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

const eventManagerRoles = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.PANITIA_EVENT,
];

export async function GET(request: Request) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = eventListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getEventList(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },

      parsed.data,
    );

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRoles(request.headers, eventManagerRoles);

    const body = await request.json().catch(() => null);

    const parsed = eventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const event = await createEvent(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },

      parsed.data,
    );

    return apiSuccess(event, {
      status: 201,
      message: "Event berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
