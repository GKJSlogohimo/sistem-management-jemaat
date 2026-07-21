import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api/api-client";

import {
  createWilayahRequest,
  deleteWilayahRequest,
  updateWilayahRequest,
} from "../api/wilayah.api";
import { wilayahKeys } from "../query-keys";
import type { CreateWilayahInput, UpdateWilayahInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreateWilayah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateWilayahInput) => createWilayahRequest(values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: wilayahKeys.lists(),
      });

      toast.success(response.message ?? "Wilayah berhasil ditambahkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdateWilayah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateWilayahInput }) =>
      updateWilayahRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: wilayahKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: wilayahKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Wilayah berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeleteWilayah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWilayahRequest,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: wilayahKeys.lists(),
      });

      toast.success(response.message ?? "Wilayah berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
