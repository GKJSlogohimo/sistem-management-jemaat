import {
  unitGerejaFormSchema,
  unitGerejaListQuerySchema,
} from "@/features/unit-gereja/schemas/unit-gereja.schema";
import {
  createUnitGereja,
  getUnitGerejaList,
} from "@/features/unit-gereja/server/unit-gereja.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { UNIT_GEREJA_READ_ROLES, UNIT_GEREJA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_READ_ROLES);

    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = unitGerejaListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getUnitGerejaList(parsed.data);

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_WRITE_ROLES);
    const body = await request.json().catch(() => null);

    const parsed = unitGerejaFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const unit = await createUnitGereja(parsed.data);

    return apiSuccess(unit, {
      status: 201,
      message: "Unit gereja berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
