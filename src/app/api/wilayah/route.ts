import {
  wilayahFormSchema,
  wilayahListQuerySchema,
} from "@/features/wilayah/schemas/wilayah.schema";
import { createWilayah, getWilayahList } from "@/features/wilayah/server/wilayah.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { WILAYAH_READ_ROLES, WILAYAH_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, WILAYAH_READ_ROLES);

    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = wilayahListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getWilayahList(parsed.data);

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiRoles(request.headers, WILAYAH_WRITE_ROLES);

    const body = await request.json().catch(() => null);

    const parsed = wilayahFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const wilayah = await createWilayah(parsed.data);

    return apiSuccess(wilayah, {
      status: 201,
      message: "Wilayah berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
