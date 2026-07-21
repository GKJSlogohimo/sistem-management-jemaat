import { jemaatPenggunaOptionsQuerySchema } from "@/features/pengguna/schemas/pengguna.schema";
import { getJemaatPenggunaOptions } from "@/features/pengguna/server/pengguna.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireRoles } from "@/lib/auth/require-profile";

export async function GET(request: Request) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = jemaatPenggunaOptionsQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const data = await getJemaatPenggunaOptions(parsed.data.unitGerejaId, parsed.data.userId);

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
