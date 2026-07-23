import {
  pernikahanIdParamsSchema,
  updatePernikahanSchema,
} from "@/features/pernikahan/schemas/pernikahan.schema";
import {
  deletePernikahan,
  getPernikahanById,
  updatePernikahan,
} from "@/features/pernikahan/server/pernikahan.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { PERNIKAHAN_READ_ROLES, PERNIKAHAN_WRITE_ROLES } from "@/lib/auth/access-roles";
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
    const authActor = await requireApiRoles(request.headers, PERNIKAHAN_READ_ROLES);

    const { id } = pernikahanIdParamsSchema.parse(await context.params);

    const result = await getPernikahanById(createActor(authActor), id);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, PERNIKAHAN_WRITE_ROLES);

    const { id } = pernikahanIdParamsSchema.parse(await context.params);

    const input = updatePernikahanSchema.parse(await request.json());

    const result = await updatePernikahan(createActor(authActor), id, input);

    return apiSuccess(result, {
      message: "Data Pernikahan berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, PERNIKAHAN_WRITE_ROLES);

    const { id } = pernikahanIdParamsSchema.parse(await context.params);

    const result = await deletePernikahan(createActor(authActor), id);

    return apiSuccess(result, {
      message: "Data Pernikahan berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
