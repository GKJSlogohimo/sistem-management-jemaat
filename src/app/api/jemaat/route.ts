import { jemaatFormSchema, jemaatListQuerySchema } from "@/features/jemaat/schemas/jemaat.schema";
import { createJemaat, getJemaatList } from "@/features/jemaat/server/jemaat.service";
import { apiPaginated, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { JEMAAT_READ_ROLES, JEMAAT_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

export async function GET(request: Request) {
  try {
    const actor = await requireApiRoles(request.headers, JEMAAT_READ_ROLES);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = jemaatListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const result = await getJemaatList(
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
    const actor = await requireApiRoles(request.headers, JEMAAT_WRITE_ROLES);

    const body = await request.json().catch(() => null);
    const parsed = jemaatFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const jemaat = await createJemaat(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsed.data,
    );

    return apiSuccess(jemaat, {
      status: 201,
      message: "Data jemaat berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
