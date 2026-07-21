import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api/api-client";

import {
  createKeluargaRequest,
  deleteKeluargaRequest,
  updateKeluargaRequest,
} from "../api/keluarga.api";
import { keluargaKeys } from "../query-keys";
import type { CreateKeluargaInput, UpdateKeluargaInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreateKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateKeluargaInput) => createKeluargaRequest(values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: keluargaKeys.lists(),
      });

      toast.success(response.message ?? "Data keluarga berhasil ditambahkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdateKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateKeluargaInput }) =>
      updateKeluargaRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: keluargaKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: keluargaKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Data keluarga berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeleteKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKeluargaRequest,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: keluargaKeys.lists(),
      });

      toast.success(response.message ?? "Data keluarga berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
