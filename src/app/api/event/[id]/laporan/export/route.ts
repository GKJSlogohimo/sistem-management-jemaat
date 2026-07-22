import { z } from "zod";

import { getLaporanEvent } from "@/features/laporan-event/server/laporan-event.service";
import { buildLaporanEventCsv } from "@/features/laporan-event/server/laporan-event-csv";
import { handleApiError } from "@/lib/api/handle-api-error";
import { canReadNik } from "@/lib/auth/access-roles";
import { requireActiveProfile } from "@/lib/auth/require-profile";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createSafeFilename(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const params = paramsSchema.parse(await context.params);

    const laporan = await getLaporanEvent(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },
      params.id,
    );

    const includeNik = canReadNik(actor.profile.peran);

    const csv = buildLaporanEventCsv(laporan, {
      includeNik,
    });

    const filename = createSafeFilename(laporan.event.nama) || "event";

    return new Response(csv, {
      status: 200,

      headers: {
        "Content-Type": "text/csv; charset=utf-8",

        "Content-Disposition": `attachment; filename="laporan-${filename}.csv"`,

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
