import { z } from "zod";

import { createEventTokenRequest } from "@/app/api/realtime/ably-server";
import { getEventById } from "@/features/event/server/event.service";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireActiveProfile } from "@/lib/auth/require-profile";

const querySchema = z.object({
  eventId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const actor = await requireActiveProfile(request.headers);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());

    const parsed = querySchema.parse(query);

    /*
     * Memastikan pengguna memang boleh
     * mengakses Event dan Unit Gereja
     * tersebut sebelum token diterbitkan.
     */
    await getEventById(
      {
        userId: actor.session.user.id,

        peran: actor.profile.peran,

        unitGerejaId: actor.profile.unitGerejaId,
      },

      parsed.eventId,
    );

    const tokenRequest = await createEventTokenRequest({
      userId: actor.session.user.id,

      eventId: parsed.eventId,
    });

    /*
     * Jangan dibungkus apiSuccess().
     * Ably membutuhkan TokenRequest
     * secara langsung.
     */
    return Response.json(tokenRequest, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
