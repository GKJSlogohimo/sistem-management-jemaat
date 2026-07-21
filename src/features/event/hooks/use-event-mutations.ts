import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api/api-client";

import { createEventRequest, deleteEventRequest, updateEventRequest } from "../api/event.api";
import { eventKeys } from "../query-keys";
import type { CreateEventInput, UpdateEventInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateEventInput) => createEventRequest(values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });

      toast.success(response.message ?? "Event berhasil ditambahkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateEventInput }) =>
      updateEventRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: eventKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: eventKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Event berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventRequest,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: eventKeys.lists(),
      });

      toast.success(response.message ?? "Event berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
