import { publishEventChanged } from "@/app/api/realtime/ably-server";
import { eventIdSchema } from "@/features/event/schemas/event.schema";
import {
  pesertaEventFormSchema,
  pesertaEventListQuerySchema,
} from "@/features/peserta-event/schemas/peserta-event.schema";
import {
  createPesertaEvent,
  getPesertaEventList,
} from "@/features/peserta-event/server/peserta-event.service";
import { PeranPengguna } from "@/generated/prisma/enums";
import { apiError, apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

const participantManagerRoles = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.PANITIA_EVENT,
  PeranPengguna.PETUGAS_REGISTRASI,
];

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

    const { id } = await params;

    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsedQuery = pesertaEventListQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiValidationError(parsedQuery.error);
    }

    const result = await getPesertaEventList(getActor(actor), parsedId.data, parsedQuery.data);

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireRoles(request.headers, participantManagerRoles);

    const { id } = await params;

    const parsedId = eventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Event tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = pesertaEventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const peserta = await createPesertaEvent(getActor(actor), parsedId.data, parsed.data);

    await publishEventChanged(parsedId.data, "PESERTA_DITAMBAHKAN");

    return apiSuccess(peserta, {
      status: 201,
      message: "Peserta berhasil didaftarkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
