import {
  kategoriEventFormSchema,
  kategoriEventIdSchema,
} from "@/features/kategori-event/schemas/kategori-event.schema";
import {
  deleteKategoriEvent,
  getKategoriEventById,
  updateKategoriEvent,
} from "@/features/kategori-event/server/kategori-event.service";
import { PeranPengguna } from "@/generated/prisma/client";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile, requireRoles } from "@/lib/auth/require-profile";

type KategoriEventRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: KategoriEventRouteProps) {
  try {
    await requireActiveProfile(request.headers);

    const { id } = await params;

    const parsedId = kategoriEventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Kategori Event tidak valid.", {
        status: 400,
      });
    }

    const kategori = await getKategoriEventById(parsedId.data);

    return apiSuccess(kategori);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: KategoriEventRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;

    const parsedId = kategoriEventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Kategori Event tidak valid.", {
        status: 400,
      });
    }

    const body = await request.json().catch(() => null);

    const parsed = kategoriEventFormSchema.safeParse(body);

    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const kategori = await updateKategoriEvent(parsedId.data, parsed.data);

    return apiSuccess(kategori, {
      message: "Kategori Event berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: KategoriEventRouteProps) {
  try {
    await requireRoles(request.headers, [PeranPengguna.SUPER_ADMIN]);

    const { id } = await params;

    const parsedId = kategoriEventIdSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("BAD_REQUEST", "ID Kategori Event tidak valid.", {
        status: 400,
      });
    }

    const result = await deleteKategoriEvent(parsedId.data);

    return apiSuccess(result, {
      message: "Kategori Event berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
