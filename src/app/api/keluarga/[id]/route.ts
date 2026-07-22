import { keluargaFormSchema, keluargaIdSchema } from "@/features/keluarga/schemas/keluarga.schema";
import {
  deleteKeluarga,
  getKeluargaById,
  updateKeluarga,
} from "@/features/keluarga/server/keluarga.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KELUARGA_READ_ROLES, KELUARGA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type KeluargaRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: KeluargaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, KELUARGA_READ_ROLES);

    const { id } = await params;
    const parsedId = keluargaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID keluarga tidak valid.", {
        status: 400,
      });
    }

    const keluarga = await getKeluargaById(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
    );

    return apiSuccess(keluarga);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: KeluargaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, KELUARGA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = keluargaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID keluarga tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = keluargaFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const keluarga = await updateKeluarga(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
      parsed.data,
    );

    return apiSuccess(keluarga, {
      message: "Data keluarga berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: KeluargaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, KELUARGA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = keluargaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID keluarga tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteKeluarga(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
    );

    return apiSuccess(result, {
      message: "Data keluarga berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
