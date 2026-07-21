import { eventIdSchema } from "@/features/event/schemas/event.schema";
import {
  type OperasionalEventAction,
  operasionalEventActionSchema,
  operasionalEventQuerySchema,
} from "@/features/operasional-event/schemas/operasional-event.schema";
import {
  executeOperasionalEventAction,
  getOperasionalEventState,
} from "@/features/operasional-event/server/operasional-event.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { AppError } from "@/lib/api/app-error";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const managerRoles = [
  PeranPengguna.SUPER_ADMIN,
  PeranPengguna.ADMIN_INDUK,
  PeranPengguna.ADMIN_SUB_INDUK,
  PeranPengguna.PANITIA_EVENT,
];

const rolesByAction: Record<OperasionalEventAction, PeranPengguna[]> = {
  CHECK_IN: [...managerRoles, PeranPengguna.PETUGAS_REGISTRASI, PeranPengguna.PETUGAS_ANTREAN],

  PANGGIL: [...managerRoles, PeranPengguna.PETUGAS_ANTREAN],

  PANGGIL_BERIKUTNYA: [...managerRoles, PeranPengguna.PETUGAS_ANTREAN],

  KEMBALIKAN: [...managerRoles, PeranPengguna.PETUGAS_ANTREAN],

  SELESAI: [...managerRoles, PeranPengguna.PETUGAS_ANTREAN, PeranPengguna.PELAYAN],

  BATAL: [...managerRoles, PeranPengguna.PETUGAS_REGISTRASI, PeranPengguna.PETUGAS_ANTREAN],
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

    const allowedRoles = rolesByAction[parsed.data.action];

    if (!allowedRoles.includes(actor.profile.peran)) {
      throw new AppError("Anda tidak memiliki izin untuk melakukan tindakan ini.", {
        status: 403,
        code: "FORBIDDEN",
      });
    }

    const result = await executeOperasionalEventAction(getActor(actor), parsedId.data, parsed.data);

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
