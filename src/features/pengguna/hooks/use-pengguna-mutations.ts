import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPenggunaRequest,
  deactivatePenggunaRequest,
  updatePenggunaRequest,
} from "../api/pengguna.api";
import { penggunaKeys } from "../query-keys";
import type { CreatePenggunaInput, UpdatePenggunaInput } from "../types";

export function useCreatePengguna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreatePenggunaInput) => createPenggunaRequest(values),

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: penggunaKeys.lists(),
      });

      toast.success(response.message ?? "Akun pengguna berhasil dibuat.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePengguna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdatePenggunaInput }) =>
      updatePenggunaRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: penggunaKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: penggunaKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Pengguna berhasil diperbarui.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeactivatePengguna() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePenggunaRequest,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: penggunaKeys.lists(),
      });

      toast.success(response.message ?? "Akun berhasil dinonaktifkan.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
