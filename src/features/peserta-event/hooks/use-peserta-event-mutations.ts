import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { eventKeys } from "@/features/event/query-keys";
import { ApiClientError } from "@/lib/api/api-client";

import {
  createPesertaEventRequest,
  deletePesertaEventRequest,
  updatePesertaEventRequest,
} from "../api/peserta-event.api";
import { pesertaEventKeys } from "../query-keys";
import type { CreatePesertaEventInput, UpdatePesertaEventInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreatePesertaEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreatePesertaEventInput) => createPesertaEventRequest(eventId, values),

    onSuccess: async (response) => {
      await Promise.all([
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

      toast.success(response.message ?? "Peserta berhasil didaftarkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdatePesertaEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pesertaId, values }: { pesertaId: string; values: UpdatePesertaEventInput }) =>
      updatePesertaEventRequest(eventId, pesertaId, values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: pesertaEventKeys.lists(eventId),
      });

      toast.success(response.message ?? "Data peserta berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeletePesertaEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pesertaId: string) => deletePesertaEventRequest(eventId, pesertaId),

    onSuccess: async (response) => {
      await Promise.all([
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

      toast.success(response.message ?? "Peserta berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
