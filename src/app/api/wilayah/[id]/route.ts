import { wilayahFormSchema, wilayahIdSchema } from "@/features/wilayah/schemas/wilayah.schema";
import {
  deleteWilayah,
  getWilayahById,
  updateWilayah,
} from "@/features/wilayah/server/wilayah.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { WILAYAH_READ_ROLES, WILAYAH_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type WilayahRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: WilayahRouteProps) {
  try {
    await requireApiRoles(request.headers, WILAYAH_READ_ROLES);

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
    await requireApiRoles(request.headers, WILAYAH_WRITE_ROLES);

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
    await requireApiRoles(request.headers, WILAYAH_WRITE_ROLES);

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
