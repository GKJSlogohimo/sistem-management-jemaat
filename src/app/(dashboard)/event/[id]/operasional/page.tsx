import type { Metadata } from "next";

import { OperasionalEventWorkspace } from "@/features/operasional-event/components/operasional-event-workspace";

export const metadata: Metadata = {
  title: "Operasional Event | Sistem Manajemen Jemaat",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OperasionalEventPage({ params }: Props) {
  const { id } = await params;

  return <OperasionalEventWorkspace eventId={id} />;
}
