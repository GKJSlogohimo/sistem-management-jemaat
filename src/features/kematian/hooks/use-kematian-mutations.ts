"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createKematianRequest,
  deleteKematianRequest,
  updateKematianRequest,
} from "../api/kematian-api";
import { kematianKeys } from "../kematian-keys";
import type { CreateKematianInput, UpdateKematianInput } from "../types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan pada pencatatan kematian.";
}

export function useCreateKematian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateKematianInput) => createKematianRequest(values),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kematianKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kematianKeys.jemaatOptions(),
        }),

        queryClient.invalidateQueries({
          queryKey: ["jemaat"],
        }),
      ]);

      toast.success("Pencatatan kematian berhasil ditambahkan.");
    },

    onError: (error) => {
      if (!(error instanceof Error)) {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useUpdateKematian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateKematianInput }) =>
      updateKematianRequest(id, values),

    onSuccess: async (response) => {
      queryClient.setQueryData(kematianKeys.detail(response.data.id), response);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kematianKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kematianKeys.jemaatOptions(),
        }),

        queryClient.invalidateQueries({
          queryKey: ["jemaat"],
        }),
      ]);

      toast.success("Pencatatan kematian berhasil diperbarui.");
    },

    onError: (error) => {
      if (!(error instanceof Error)) {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useDeleteKematian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteKematianRequest(id),

    onSuccess: async (response) => {
      queryClient.removeQueries({
        queryKey: kematianKeys.detail(response.data.id),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: kematianKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: kematianKeys.jemaatOptions(),
        }),
      ]);

      toast.success("Pencatatan kematian berhasil dihapus.");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
