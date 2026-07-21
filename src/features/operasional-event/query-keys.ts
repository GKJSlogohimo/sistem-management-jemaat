export const operasionalEventKeys = {
  all: ["operasional-event"] as const,

  event: (eventId: string) => [...operasionalEventKeys.all, eventId] as const,

  state: (eventId: string, q: string) =>
    [...operasionalEventKeys.event(eventId), "state", q] as const,
};
