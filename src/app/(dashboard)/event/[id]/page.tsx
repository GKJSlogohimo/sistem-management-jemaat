import type { Metadata } from "next";

import { EventWorkspace } from "@/features/peserta-event/components/event-workspace";

export const metadata: Metadata = {
  title: "Detail Event | Sistem Manajemen Jemaat",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  return <EventWorkspace eventId={id} />;
}
