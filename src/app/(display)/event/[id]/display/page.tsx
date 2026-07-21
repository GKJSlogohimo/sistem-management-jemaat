import type { Metadata } from "next";

import { EventDisplay } from "@/features/operasional-event/components/event-display";

export const metadata: Metadata = {
  title: "Display Antrean | Sistem Manajemen Jemaat",
};

type EventDisplayPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDisplayPage({ params }: EventDisplayPageProps) {
  const { id } = await params;

  return <EventDisplay eventId={id} />;
}
