import { getUnitGerejaIndukOptions } from "@/features/unit-gereja/server/unit-gereja.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { UNIT_GEREJA_READ_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, UNIT_GEREJA_READ_ROLES);

    const options = await getUnitGerejaIndukOptions();

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
