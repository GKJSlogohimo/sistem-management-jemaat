import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api/api-client";

import { createJemaatRequest, deleteJemaatRequest, updateJemaatRequest } from "../api/jemaat.api";
import { jemaatKeys } from "../query-keys";
import type { CreateJemaatInput, UpdateJemaatInput } from "../types";

function showMutationError(error: Error) {
  if (error instanceof ApiClientError && error.fieldErrors) {
    return;
  }

  toast.error(error.message);
}

export function useCreateJemaat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateJemaatInput) => createJemaatRequest(values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: jemaatKeys.lists(),
      });

      toast.success(response.message ?? "Data jemaat berhasil ditambahkan.");
    },

    onError: showMutationError,
  });
}

export function useUpdateJemaat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateJemaatInput }) =>
      updateJemaatRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jemaatKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jemaatKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Data jemaat berhasil diperbarui.");
    },

    onError: showMutationError,
  });
}

export function useDeleteJemaat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJemaatRequest,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: jemaatKeys.lists(),
      });

      toast.success(response.message ?? "Data jemaat berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
