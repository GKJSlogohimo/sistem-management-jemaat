import {
  createKematianSchema,
  kematianListQuerySchema,
} from "@/features/kematian/schemas/kematian.schema";
import { createKematian, getKematianList } from "@/features/kematian/server/kematian.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { KEMATIAN_READ_ROLES, KEMATIAN_WRITE_ROLES } from "@/lib/auth/access-roles";
import type { AppActor } from "@/lib/auth/actor";
import { requireApiRoles } from "@/lib/auth/require-api-role";

function createActor(authActor: Awaited<ReturnType<typeof requireApiRoles>>): AppActor {
  return {
    userId: authActor.session.user.id,
    peran: authActor.profile.peran,
    unitGerejaId: authActor.profile.unitGerejaId,
  };
}

export async function GET(request: Request) {
  try {
    const authActor = await requireApiRoles(request.headers, KEMATIAN_READ_ROLES);

    const url = new URL(request.url);

    const params = kematianListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));

    const result = await getKematianList(createActor(authActor), params);

    return apiSuccess(result.data, {
      meta: {
        pagination: result.pagination,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const authActor = await requireApiRoles(request.headers, KEMATIAN_WRITE_ROLES);

    const input = createKematianSchema.parse(await request.json());

    const result = await createKematian(createActor(authActor), input);

    return apiSuccess(result, {
      status: 201,
      message: "Pencatatan kematian berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
