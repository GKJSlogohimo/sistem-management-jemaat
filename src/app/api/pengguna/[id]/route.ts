import {
  penggunaIdSchema,
  updatePenggunaSchema,
} from "@/features/pengguna/schemas/pengguna.schema";
import {
  deactivatePengguna,
  getPenggunaById,
  updatePengguna,
} from "@/features/pengguna/server/pengguna.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireRoles } from "@/lib/auth/require-profile";

type PenggunaRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: PenggunaRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;
    const parsedId = penggunaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID pengguna tidak valid.", {
        status: 400,
      });
    }

    return apiSuccess(await getPenggunaById(parsedId.data));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: PenggunaRouteProps) {
  try {
    const actor = await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

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

    const pengguna = await updatePengguna(parsedId.data, actor.session.user.id, parsed.data);

    return apiSuccess(pengguna, {
      message: "Pengguna berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: PenggunaRouteProps) {
  try {
    const actor = await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;
    const parsedId = penggunaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID pengguna tidak valid.", {
        status: 400,
      });
    }

    const result = await deactivatePengguna(parsedId.data, actor.session.user.id);

    return apiSuccess(result, {
      message: "Akun pengguna berhasil dinonaktifkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
