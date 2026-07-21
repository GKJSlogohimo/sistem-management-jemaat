import {
  createPenggunaSchema,
  penggunaListQuerySchema,
} from "@/features/pengguna/schemas/pengguna.schema";
import { createPengguna, getPenggunaList } from "@/features/pengguna/server/pengguna.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireRoles } from "@/lib/auth/require-profile";

export async function GET(request: Request) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = penggunaListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getPenggunaList(parsed.data);

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const body = await request.json().catch(() => null);

    const parsed = createPenggunaSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const pengguna = await createPengguna(parsed.data);

    return apiSuccess(pengguna, {
      status: 201,
      message: "Akun pengguna berhasil dibuat.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
