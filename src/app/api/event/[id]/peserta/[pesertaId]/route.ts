import { eventIdSchema } from "@/features/event/schemas/event.schema";
import {
  pesertaEventFormSchema,
  pesertaEventIdSchema,
} from "@/features/peserta-event/schemas/peserta-event.schema";
import {
  deletePesertaEvent,
  updatePesertaEvent,
} from "@/features/peserta-event/server/peserta-event.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireRoles } from "@/lib/auth/require-profile";

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
    pesertaId: string;
  }>;
};

function getActor(result: Awaited<ReturnType<typeof requireRoles>>) {
  return {
    userId: result.session.user.id,
    peran: result.profile.peran,
    unitGerejaId: result.profile.unitGerejaId,
  };
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireRoles(request.headers, participantManagerRoles);

    const { id, pesertaId } = await params;

    const parsedEventId = eventIdSchema.safeParse(id);

    const parsedPesertaId = pesertaEventIdSchema.safeParse(pesertaId);

    if (!parsedEventId.success || !parsedPesertaId.success) {
      return apiError("BAD_REQUEST", "ID Event atau peserta tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = pesertaEventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const peserta = await updatePesertaEvent(
      getActor(actor),
      parsedEventId.data,
      parsedPesertaId.data,
      parsed.data,
    );

    return apiSuccess(peserta, {
      message: "Data peserta berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const actor = await requireRoles(request.headers, participantManagerRoles);

    const { id, pesertaId } = await params;

    const parsedEventId = eventIdSchema.safeParse(id);

    const parsedPesertaId = pesertaEventIdSchema.safeParse(pesertaId);

    if (!parsedEventId.success || !parsedPesertaId.success) {
      return apiError("BAD_REQUEST", "ID Event atau peserta tidak valid.", {
        status: 400,
      });
    }

    const result = await deletePesertaEvent(
      getActor(actor),
      parsedEventId.data,
      parsedPesertaId.data,
    );

    return apiSuccess(result, {
      message: "Peserta berhasil dihapus dari Event.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
