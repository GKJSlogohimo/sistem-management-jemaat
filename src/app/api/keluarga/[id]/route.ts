import { keluargaFormSchema, keluargaIdSchema } from "@/features/keluarga/schemas/keluarga.schema";
import {
  deleteKeluarga,
  getKeluargaById,
  updateKeluarga,
} from "@/features/keluarga/server/keluarga.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

type KeluargaRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: KeluargaRouteProps) {
  try {
    await requireActiveProfile(request.headers);

    const { id } = await params;
    const parsedId = keluargaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID keluarga tidak valid.", {
        status: 400,
      });
    }

    const keluarga = await getKeluargaById(parsedId.data);

    return apiSuccess(keluarga);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: KeluargaRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

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

    const keluarga = await updateKeluarga(parsedId.data, parsed.data);

    return apiSuccess(keluarga, {
      message: "Data keluarga berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: KeluargaRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;
    const parsedId = keluargaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID keluarga tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteKeluarga(parsedId.data);

    return apiSuccess(result, {
      message: "Data keluarga berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
