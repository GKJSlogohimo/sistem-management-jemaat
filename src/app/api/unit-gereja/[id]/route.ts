import {
  unitGerejaFormSchema,
  unitGerejaIdSchema,
} from "@/features/unit-gereja/schemas/unit-gereja.schema";
import {
  deleteUnitGereja,
  getUnitGerejaById,
  updateUnitGereja,
} from "@/features/unit-gereja/server/unit-gereja.service";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { apiError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { UNIT_GEREJA_READ_ROLES, UNIT_GEREJA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type UnitGerejaRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: UnitGerejaRouteProps) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_READ_ROLES);

    const { id } = await params;
    const parsedId = unitGerejaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID unit gereja tidak valid.", {
        status: 400,
      });
    }

    const unit = await getUnitGerejaById(parsedId.data);

    return apiSuccess(unit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: UnitGerejaRouteProps) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = unitGerejaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID unit gereja tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = unitGerejaFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const unit = await updateUnitGereja(parsedId.data, parsed.data);

    return apiSuccess(unit, {
      message: "Unit gereja berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: UnitGerejaRouteProps) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_WRITE_ROLES);

    const { id } = await params;
    const parsedId = unitGerejaIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID unit gereja tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteUnitGereja(parsedId.data);

    return apiSuccess(result, {
      message: "Unit gereja berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
