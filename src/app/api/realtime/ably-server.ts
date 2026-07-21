import "server-only";

import * as Ably from "ably";

import {
  EVENT_CHANGED_MESSAGE,
  type EventChangedReason,
  getEventRealtimeChannel,
  QUEUE_CALLED_MESSAGE,
  type QueueCalledPayload,
} from "./event-realtime";

let ablyRest: Ably.Rest | undefined;

function getAblyRest() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    throw new Error("Environment variable ABLY_API_KEY belum dikonfigurasi.");
  }

  if (!ablyRest) {
    ablyRest = new Ably.Rest({
      key: apiKey,
    });
  }

  return ablyRest;
}

export async function createEventTokenRequest({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}) {
  const channelName = getEventRealtimeChannel(eventId);

  return getAblyRest().auth.createTokenRequest({
    clientId: userId,

    /*
     * Browser hanya boleh subscribe.
     * Publish selalu dilakukan server.
     */
    capability: JSON.stringify({
      [channelName]: ["subscribe"],
    }),

    /*
     * Satu jam. SDK akan melakukan
     * refresh token secara otomatis.
     */
    ttl: 60 * 60 * 1000,
  });
}

export async function publishEventChanged(eventId: string, reason: EventChangedReason) {
  try {
    const channel = getAblyRest().channels.get(getEventRealtimeChannel(eventId));

    await channel.publish(EVENT_CHANGED_MESSAGE, {
      eventId,
      reason,
      occurredAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    /*
     * Perubahan database tidak boleh
     * dianggap gagal hanya karena
     * notifikasi realtime bermasalah.
     *
     * Polling fallback akan mengambil
     * perubahan tersebut.
     */
    console.error("Gagal menerbitkan perubahan Event ke Ably:", error);

    return false;
  }
}

export async function publishQueueCalled({
  eventId,
  pesertaId,
  nomorAntrian,
  tujuan = "meja pelayanan",
}: {
  eventId: string;
  pesertaId: string;
  nomorAntrian: number;
  tujuan?: string;
}) {
  try {
    const channel = getAblyRest().channels.get(getEventRealtimeChannel(eventId));

    const payload: QueueCalledPayload = {
      eventId,
      pesertaId,
      nomorAntrian,
      tujuan,
      occurredAt: new Date().toISOString(),
    };

    await channel.publish(QUEUE_CALLED_MESSAGE, payload);

    return true;
  } catch (error) {
    console.error("Gagal mengirim panggilan antrean ke Ably:", error);

    return false;
  }
}
