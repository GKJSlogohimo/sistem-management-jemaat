import { jemaatFormSchema, jemaatIdSchema } from "@/features/jemaat/schemas/jemaat.schema";
import { deleteJemaat, getJemaatById, updateJemaat } from "@/features/jemaat/server/jemaat.service";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { JEMAAT_READ_ROLES, JEMAAT_WRITE_ROLES } from "@/lib/auth/access-roles";
import { requireApiRoles } from "@/lib/auth/require-api-role";

type JemaatRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: JemaatRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, JEMAAT_READ_ROLES);

    const { id } = await params;
    const parsedId = jemaatIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID jemaat tidak valid.", {
        status: 400,
      });
    }

    return apiSuccess(
      await getJemaatById(
        {
          userId: actor.session.user.id,

          peran: actor.profile.peran,

          unitGerejaId: actor.profile.unitGerejaId,
        },
        parsedId.data,
      ),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: JemaatRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, JEMAAT_WRITE_ROLES);

    const { id } = await params;
    const parsedId = jemaatIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID jemaat tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = jemaatFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const jemaat = await updateJemaat(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
      parsed.data,
    );

    return apiSuccess(jemaat, {
      message: "Data jemaat berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: JemaatRouteProps) {
  try {
    const actor = await requireApiRoles(request.headers, JEMAAT_WRITE_ROLES);

    const { id } = await params;
    const parsedId = jemaatIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID jemaat tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteJemaat(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      parsedId.data,
    );

    return apiSuccess(result, {
      message: "Data jemaat berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
