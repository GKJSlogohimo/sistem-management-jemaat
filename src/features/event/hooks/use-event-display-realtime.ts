"use client";

import { useQueryClient } from "@tanstack/react-query";
import * as Ably from "ably";
import { useEffect, useRef, useState } from "react";

import {
  EVENT_CHANGED_MESSAGE,
  getEventRealtimeChannel,
  isEventChangedPayload,
  isQueueCalledPayload,
  QUEUE_CALLED_MESSAGE,
  type QueueCalledPayload,
} from "@/app/api/realtime/event-realtime";
import { operasionalEventKeys } from "@/features/operasional-event/query-keys";

type RealtimeConnectionState =
  | "initialized"
  | "connecting"
  | "connected"
  | "disconnected"
  | "suspended"
  | "closing"
  | "closed"
  | "failed";

type UseEventDisplayRealtimeOptions = {
  eventId: string;

  onQueueCalled: (payload: QueueCalledPayload) => void;
};

export function useEventDisplayRealtime({
  eventId,
  onQueueCalled,
}: UseEventDisplayRealtimeOptions) {
  const queryClient = useQueryClient();

  const onQueueCalledRef = useRef(onQueueCalled);

  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("initialized");

  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    onQueueCalledRef.current = onQueueCalled;
  }, [onQueueCalled]);

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

      const state = client.connection.state as RealtimeConnectionState;

      setConnectionState(state);

      if (state === "connected") {
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

    const handleEventChanged = (message: Ably.Message) => {
      if (disposed || !isEventChangedPayload(message.data) || message.data.eventId !== eventId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: operasionalEventKeys.event(eventId),
      });
    };

    const handleQueueCalled = (message: Ably.Message) => {
      if (disposed || !isQueueCalledPayload(message.data) || message.data.eventId !== eventId) {
        return;
      }

      onQueueCalledRef.current(message.data);

      void queryClient.invalidateQueries({
        queryKey: operasionalEventKeys.event(eventId),
      });
    };

    client.connection.on(handleConnectionChange);

    client.connection.on("failed", handleConnectionFailure);

    client.connection.on("suspended", handleConnectionFailure);

    void Promise.all([
      channel.subscribe(EVENT_CHANGED_MESSAGE, handleEventChanged),

      channel.subscribe(QUEUE_CALLED_MESSAGE, handleQueueCalled),
    ]).catch((error: unknown) => {
      if (disposed) {
        return;
      }

      setConnectionError(error instanceof Error ? error.message : "Gagal berlangganan realtime.");
    });

    handleConnectionChange();

    return () => {
      disposed = true;

      channel.unsubscribe(EVENT_CHANGED_MESSAGE, handleEventChanged);

      channel.unsubscribe(QUEUE_CALLED_MESSAGE, handleQueueCalled);

      client.connection.off(handleConnectionChange);

      client.connection.off("failed", handleConnectionFailure);

      client.connection.off("suspended", handleConnectionFailure);

      /*
       * Tidak perlu channel.detach().
       * close() menutup client ini.
       */
      client.close();
    };
  }, [eventId, queryClient]);

  return {
    connectionState,

    connected: connectionState === "connected",

    connectionError,
  };
}
