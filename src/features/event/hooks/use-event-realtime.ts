"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as Ably from "ably";
import { useEffect, useState } from "react";

import {
  EVENT_CHANGED_MESSAGE,
  getEventRealtimeChannel,
  isEventChangedPayload,
} from "@/app/api/realtime/event-realtime";
import { operasionalEventKeys } from "@/features/operasional-event/query-keys";
import { pesertaEventKeys } from "@/features/peserta-event/query-keys";

import { eventKeys } from "../query-keys";

type RealtimeConnectionState =
  | "initialized"
  | "connecting"
  | "connected"
  | "disconnected"
  | "suspended"
  | "closing"
  | "closed"
  | "failed";

export function useEventRealtime(eventId: string) {
  const queryClient = useQueryClient();

  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("initialized");

  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let disposed = false;

    const client = new Ably.Realtime({
      authUrl: `/api/realtime/token?eventId=${encodeURIComponent(eventId)}`,

      authMethod: "POST",
      echoMessages: false,
      autoConnect: true,
    });

    const channel = client.channels.get(getEventRealtimeChannel(eventId));

    const handleConnectionChange = () => {
      if (disposed) {
        return;
      }

      setConnectionState(client.connection.state as RealtimeConnectionState);

      if (client.connection.state === "connected") {
        setConnectionError(null);
      }
    };

    const handleConnectionFailure = (stateChange: Ably.ConnectionStateChange) => {
      if (disposed) {
        return;
      }

      setConnectionState(stateChange.current as RealtimeConnectionState);

      setConnectionError(stateChange.reason?.message ?? "Koneksi realtime gagal.");
    };

    const handleMessage = (message: Ably.Message) => {
      if (disposed || !isEventChangedPayload(message.data) || message.data.eventId !== eventId) {
        return;
      }

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: operasionalEventKeys.event(eventId),
        }),

        queryClient.invalidateQueries({
          queryKey: pesertaEventKeys.lists(eventId),
        }),

        queryClient.invalidateQueries({
          queryKey: eventKeys.detail(eventId),
        }),

        queryClient.invalidateQueries({
          queryKey: eventKeys.lists(),
        }),
      ]);
    };

    client.connection.on(handleConnectionChange);

    client.connection.on("failed", handleConnectionFailure);

    client.connection.on("suspended", handleConnectionFailure);

    void channel.subscribe(EVENT_CHANGED_MESSAGE, handleMessage).catch((error: unknown) => {
      if (disposed) {
        return;
      }

      setConnectionError(
        error instanceof Error ? error.message : "Gagal berlangganan realtime Event.",
      );
    });

    handleConnectionChange();

    return () => {
      disposed = true;

      channel.unsubscribe(EVENT_CHANGED_MESSAGE, handleMessage);

      client.connection.off(handleConnectionChange);

      client.connection.off("failed", handleConnectionFailure);

      client.connection.off("suspended", handleConnectionFailure);

      client.close();
    };
  }, [eventId, queryClient]);

  return {
    connectionState,

    connected: connectionState === "connected",

    connectionError,
  };
}
