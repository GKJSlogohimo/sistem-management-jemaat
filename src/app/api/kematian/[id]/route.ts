import {
  kematianIdParamsSchema,
  updateKematianSchema,
} from "@/features/kematian/schemas/kematian.schema";
import {
  deleteKematian,
  getKematianById,
  updateKematian,
} from "@/features/kematian/server/kematian.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KEMATIAN_READ_ROLES, KEMATIAN_WRITE_ROLES } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createActor(authActor: Awaited<ReturnType<typeof requireApiRoles>>): AppActor {
  return {
    userId: authActor.session.user.id,
    peran: authActor.profile.peran,
    unitGerejaId: authActor.profile.unitGerejaId,
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, KEMATIAN_READ_ROLES);

    const { id } = kematianIdParamsSchema.parse(await context.params);

    const result = await getKematianById(createActor(authActor), id);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, KEMATIAN_WRITE_ROLES);

    const { id } = kematianIdParamsSchema.parse(await context.params);

    const input = updateKematianSchema.parse(await request.json());

    const result = await updateKematian(createActor(authActor), id, input);

    return apiSuccess(result, {
      message: "Pencatatan kematian berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, KEMATIAN_WRITE_ROLES);

    const { id } = kematianIdParamsSchema.parse(await context.params);

    const result = await deleteKematian(createActor(authActor), id);

    return apiSuccess(result, {
      message: "Pencatatan kematian berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
