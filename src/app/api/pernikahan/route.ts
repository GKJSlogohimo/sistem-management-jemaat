import {
  createPernikahanSchema,
  pernikahanListQuerySchema,
} from "@/features/pernikahan/schemas/pernikahan.schema";
import {
  createPernikahan,
  getPernikahanList,
} from "@/features/pernikahan/server/pernikahan.service";
import { apiSuccess } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { PERNIKAHAN_READ_ROLES, PERNIKAHAN_WRITE_ROLES } from "@/lib/auth/access-roles";
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
    const authActor = await requireApiRoles(request.headers, PERNIKAHAN_READ_ROLES);

    const url = new URL(request.url);

    const params = pernikahanListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));

    const result = await getPernikahanList(createActor(authActor), params);

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
    const authActor = await requireApiRoles(request.headers, PERNIKAHAN_WRITE_ROLES);

    const input = createPernikahanSchema.parse(await request.json());

    const result = await createPernikahan(createActor(authActor), input);

    return apiSuccess(result, {
      status: 201,
      message: "Data Pernikahan berhasil ditambahkan.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
