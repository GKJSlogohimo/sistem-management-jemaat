import { getActiveKategoriEventOptions } from "@/features/kategori-event/server/kategori-event.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KATEGORI_EVENT_READ_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, KATEGORI_EVENT_READ_ROLES);

    const options = await getActiveKategoriEventOptions();

    return apiSuccess(options);
  } catch (error) {
    return handleApiError(error);
  }
}
