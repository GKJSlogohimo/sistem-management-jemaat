"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createBaptisanRequest,
  deleteBaptisanRequest,
  updateBaptisanRequest,
} from "../api/baptisan-api";
import { baptisanKeys } from "../baptisan-keys";
import type { CreateBaptisanInput, UpdateBaptisanInput } from "../types";

export function useCreateBaptisan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateBaptisanInput) => createBaptisanRequest(values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.jemaatOptions(),
      });

      toast.success("Data Baptisan berhasil ditambahkan.");
    },
  });
}

export function useUpdateBaptisan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateBaptisanInput }) =>
      updateBaptisanRequest(id, values),

    onSuccess: async (response) => {
      queryClient.setQueryData(baptisanKeys.detail(response.data.id), response);

      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.jemaatOptions(),
      });

      toast.success("Data Baptisan berhasil diperbarui.");
    },
  });
}

export function useDeleteBaptisan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBaptisanRequest(id),

    onSuccess: async (response) => {
      queryClient.removeQueries({
        queryKey: baptisanKeys.detail(response.data.id),
      });

      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: baptisanKeys.jemaatOptions(),
      });

      toast.success("Data Baptisan berhasil dihapus.");
    },
  });
}
