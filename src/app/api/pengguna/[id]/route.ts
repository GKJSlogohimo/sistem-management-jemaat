import {
  penggunaIdSchema,
  updatePenggunaSchema,
} from "@/features/pengguna/schemas/pengguna.schema";
import {
  deactivatePengguna,
  getPenggunaById,
  updatePengguna,
} from "@/features/pengguna/server/pengguna.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { PENGGUNA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type PenggunaRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: PenggunaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = penggunaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID pengguna tidak valid.", {
        status: 400,
      });
    }

    return apiSuccess(
      await getPenggunaById(
        {
          userId: actor.session.user.id,

          peran: actor.profile.peran,

          unitGerejaId: actor.profile.unitGerejaId,
        },
        parsedId.data,
      ),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: PenggunaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = penggunaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID pengguna tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = updatePenggunaSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const pengguna = await updatePengguna(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
      parsed.data,
    );

    return apiSuccess(pengguna, {
      message: "Pengguna berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: PenggunaRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = penggunaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID pengguna tidak valid.", {
        status: 400,
      });
    }

    const result = await deactivatePengguna(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
    );

    return apiSuccess(result, {
      message: "Akun pengguna berhasil dinonaktifkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
