import { wilayahFormSchema, wilayahIdSchema } from "@/features/wilayah/schemas/wilayah.schema";
import {
  deleteWilayah,
  getWilayahById,
  updateWilayah,
} from "@/features/wilayah/server/wilayah.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

type WilayahRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: WilayahRouteProps) {
  try {
    await requireActiveProfile(request.headers);

    const { id } = await params;
    const parsedId = wilayahIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID wilayah tidak valid.", {
        status: 400,
      });
    }

    const wilayah = await getWilayahById(parsedId.data);

    return apiSuccess(wilayah);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: WilayahRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;
    const parsedId = wilayahIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID wilayah tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = wilayahFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const wilayah = await updateWilayah(parsedId.data, parsed.data);

    return apiSuccess(wilayah, {
      message: "Wilayah berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: WilayahRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;
    const parsedId = wilayahIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID wilayah tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteWilayah(parsedId.data);

    return apiSuccess(result, {
      message: "Wilayah berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
