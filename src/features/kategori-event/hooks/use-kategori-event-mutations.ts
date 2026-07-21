import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api/api-client";

import {
  createKategoriEventRequest,
  deleteKategoriEventRequest,
  updateKategoriEventRequest,
} from "../api/kategori-event.api";
import { kategoriEventKeys } from "../query-keys";
import type { CreateKategoriEventInput, UpdateKategoriEventInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreateKategoriEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateKategoriEventInput) => createKategoriEventRequest(values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.options(),
        }),
      ]);

      toast.success(response.message ?? "Kategori Event berhasil ditambahkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdateKategoriEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateKategoriEventInput }) =>
      updateKategoriEventRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.details(),
        }),

        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.options(),
        }),
      ]);

      toast.success(response.message ?? "Kategori Event berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeleteKategoriEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKategoriEventRequest,

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kategoriEventKeys.options(),
        }),
      ]);

      toast.success(response.message ?? "Kategori Event berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
