import {
  kategoriEventFormSchema,
  kategoriEventListQuerySchema,
} from "@/features/kategori-event/schemas/kategori-event.schema";
import {
  createKategoriEvent,
  getKategoriEventList,
} from "@/features/kategori-event/server/kategori-event.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KATEGORI_EVENT_READ_ROLES, KATEGORI_EVENT_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    await requireApiRoles(request.headers, KATEGORI_EVENT_READ_ROLES);
    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = kategoriEventListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getKategoriEventList(parsed.data);

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiRoles(request.headers, KATEGORI_EVENT_WRITE_ROLES);

    const body = await request.json().catch(() => null);

    const parsed = kategoriEventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const kategori = await createKategoriEvent(parsed.data);

    return apiSuccess(kategori, {
      status: 201,
      message: "Kategori Event berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
