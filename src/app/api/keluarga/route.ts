import {
  keluargaFormSchema,
  keluargaListQuerySchema,
} from "@/features/keluarga/schemas/keluarga.schema";
import { createKeluarga, getKeluargaList } from "@/features/keluarga/server/keluarga.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KELUARGA_READ_ROLES, KELUARGA_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, KELUARGA_READ_ROLES);

    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = keluargaListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getKeluargaList(
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
    const actor = await requireApiRoles(request.headers, KELUARGA_WRITE_ROLES);

    const body = await request.json().catch(() => null);

    const parsed = keluargaFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const keluarga = await createKeluarga(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data,
    );

    return apiSuccess(keluarga, {
      status: 201,
      message: "Data keluarga berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
