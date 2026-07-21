export const laporanEventKeys = {
  all: ["laporan-event"] as const,

  detail: (eventId: string) => [...laporanEventKeys.all, "detail", eventId] as const,
};
