import {
  baptisanIdParamsSchema,
  updateBaptisanSchema,
} from "@/features/baptisan/schemas/baptisan.schema";
import {
  deleteBaptisan,
  getBaptisanById,
  updateBaptisan,
} from "@/features/baptisan/server/baptisan.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { BAPTISAN_READ_ROLES, BAPTISAN_WRITE_ROLES } from "@/lib/auth/access-roles";
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
    const authActor = await requireApiRoles(request.headers, BAPTISAN_READ_ROLES);

    const { id } = baptisanIdParamsSchema.parse(await context.params);

    const result = await getBaptisanById(createActor(authActor), id);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, BAPTISAN_WRITE_ROLES);

    const { id } = baptisanIdParamsSchema.parse(await context.params);

    const input = updateBaptisanSchema.parse(await request.json());

    const result = await updateBaptisan(createActor(authActor), id, input);

    return apiSuccess(result, {
      message: "Data Baptisan berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authActor = await requireApiRoles(request.headers, BAPTISAN_WRITE_ROLES);

    const { id } = baptisanIdParamsSchema.parse(await context.params);

    const result = await deleteBaptisan(createActor(authActor), id);

    return apiSuccess(result, {
      message: "Data Baptisan berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
