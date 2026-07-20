import { getUnitGerejaIndukOptions } from "@/features/unit-gereja/server/unit-gereja.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

export async function GET(request: Request) {
  try {
    await requireActiveProfile(request.headers);

    const options = await getUnitGerejaIndukOptions();

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
