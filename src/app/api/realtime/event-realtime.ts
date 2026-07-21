export const EVENT_CHANGED_MESSAGE = "event.changed";

export const QUEUE_CALLED_MESSAGE = "queue.called";

export type EventChangedReason =
  | "PESERTA_DITAMBAHKAN"
  | "PESERTA_DIPERBARUI"
  | "PESERTA_DIHAPUS"
  | "CHECK_IN"
  | "PANGGIL"
  | "PANGGIL_BERIKUTNYA"
  | "KEMBALIKAN"
  | "SELESAI"
  | "BATAL"
  | "EVENT_DIPERBARUI";

export type EventChangedPayload = {
  eventId: string;
  reason: EventChangedReason;
  occurredAt: string;
};

export type QueueCalledPayload = {
  eventId: string;
  pesertaId: string;
  nomorAntrian: number;
  tujuan: string;
  occurredAt: string;
};

export function getEventRealtimeChannel(eventId: string) {
  return `event:${eventId}`;
}

export function isEventChangedPayload(value: unknown): value is EventChangedPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<EventChangedPayload>;

  return (
    typeof payload.eventId === "string" &&
    typeof payload.reason === "string" &&
    typeof payload.occurredAt === "string"
  );
}

export function isQueueCalledPayload(value: unknown): value is QueueCalledPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<QueueCalledPayload>;

  return (
    typeof payload.eventId === "string" &&
    typeof payload.pesertaId === "string" &&
    typeof payload.nomorAntrian === "number" &&
    Number.isInteger(payload.nomorAntrian) &&
    payload.nomorAntrian > 0 &&
    typeof payload.tujuan === "string" &&
    typeof payload.occurredAt === "string"
  );
}
