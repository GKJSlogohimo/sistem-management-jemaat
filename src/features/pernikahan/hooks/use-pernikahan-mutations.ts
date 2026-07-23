"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPernikahanRequest,
  deletePernikahanRequest,
  updatePernikahanRequest,
} from "../api/pernikahan-api";
import { pernikahanKeys } from "../pernikahan-keys";
import type { CreatePernikahanInput, UpdatePernikahanInput } from "../types";

export function useCreatePernikahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreatePernikahanInput) => createPernikahanRequest(values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: pernikahanKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: pernikahanKeys.jemaatOptions(),
      });

      toast.success("Data Pernikahan berhasil ditambahkan.");
    },
  });
}

export function useUpdatePernikahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdatePernikahanInput }) =>
      updatePernikahanRequest(id, values),

    onSuccess: async (response) => {
      queryClient.setQueryData(pernikahanKeys.detail(response.data.id), response);

      await queryClient.invalidateQueries({
        queryKey: pernikahanKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: pernikahanKeys.jemaatOptions(),
      });

      toast.success("Data Pernikahan berhasil diperbarui.");
    },
  });
}

export function useDeletePernikahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePernikahanRequest(id),

    onSuccess: async (response) => {
      queryClient.removeQueries({
        queryKey: pernikahanKeys.detail(response.data.id),
      });

      await queryClient.invalidateQueries({
        queryKey: pernikahanKeys.lists(),
      });

      toast.success("Data Pernikahan berhasil dihapus.");
    },
  });
}
