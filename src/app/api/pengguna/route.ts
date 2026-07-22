import {
  createPenggunaSchema,
  penggunaListQuerySchema,
} from "@/features/pengguna/schemas/pengguna.schema";
import { createPengguna, getPenggunaList } from "@/features/pengguna/server/pengguna.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { PENGGUNA_READ_ROLES, PENGGUNA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_READ_ROLES);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = penggunaListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getPenggunaList(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data,
    );

    return apiPaginated(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, PENGGUNA_WRITE_ROLES);

    const body = await request.json().catch(() => null);

    const parsed = createPenggunaSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const pengguna = await createPengguna(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data,
    );

    return apiSuccess(pengguna, {
      status: 201,
      message: "Akun pengguna berhasil dibuat.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
