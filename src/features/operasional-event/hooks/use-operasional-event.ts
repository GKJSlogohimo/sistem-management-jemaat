import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { eventKeys } from "@/features/event/query-keys";
import { pesertaEventKeys } from "@/features/peserta-event/query-keys";

import {
  executeOperasionalEventAction,
  getOperasionalEventState,
} from "../api/operasional-event.api";
import { operasionalEventKeys } from "../query-keys";
import type { ExecuteOperasionalEventInput } from "../types";

export function useOperasionalEventQuery(eventId: string, q: string) {
  return useQuery({
    queryKey: operasionalEventKeys.state(eventId, q),

    queryFn: () => getOperasionalEventState(eventId, q),

    enabled: Boolean(eventId),

    placeholderData: keepPreviousData,

    /*
     * Mendukung beberapa petugas
     * menggunakan perangkat berbeda.
     */
    refetchInterval: 5_000,
  });
}

export function useOperasionalEventMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ExecuteOperasionalEventInput) =>
      executeOperasionalEventAction(eventId, values),

    onSuccess: async (response) => {
      await Promise.all([
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

      toast.success(response.message ?? "Operasional berhasil diproses.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
