import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createUnitGerejaRequest,
  deleteUnitGerejaRequest,
  updateUnitGerejaRequest,
} from "../api/unit-gereja.api";
import { unitGerejaKeys } from "../query-keys";
import type { CreateUnitGerejaInput, UpdateUnitGerejaInput } from "../types";

export function useCreateUnitGereja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateUnitGerejaInput) => createUnitGerejaRequest(values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.options(),
        }),
      ]);

      toast.success(response.message ?? "Unit gereja berhasil ditambahkan.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUnitGereja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateUnitGerejaInput }) =>
      updateUnitGerejaRequest(id, values),

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.options(),
        }),
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.details(),
        }),
      ]);

      toast.success(response.message ?? "Unit gereja berhasil diperbarui.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUnitGereja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnitGerejaRequest,

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: unitGerejaKeys.options(),
        }),
      ]);

      toast.success(response.message ?? "Unit gereja berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
