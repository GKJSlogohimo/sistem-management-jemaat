"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreatePengguna, useUpdatePengguna } from "../hooks/use-pengguna-mutations";
import type { CreatePenggunaInput, UpdatePenggunaInput } from "../schemas/pengguna.schema";
import type { PenggunaListItem } from "../types";
import { PenggunaForm } from "./pengguna-form";

const createDefaults: CreatePenggunaInput = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  peran: "VIEWER",
  aktif: true,
  unitGerejaId: null,
  jemaatId: null,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengguna: PenggunaListItem | null;
};

export function PenggunaFormDialog({ open, onOpenChange, pengguna }: Props) {
  const createMutation = useCreatePengguna();
  const updateMutation = useUpdatePengguna();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const updateDefaults: UpdatePenggunaInput = {
    name: pengguna?.name ?? "",
    peran: pengguna?.peran ?? "VIEWER",
    aktif: pengguna?.aktif ?? true,
    unitGerejaId: pengguna?.unitGerejaId ?? null,
    jemaatId: pengguna?.jemaatId ?? null,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{pengguna ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>

          <DialogDescription>
            Atur akun, hak akses, dan cakupan Unit Gereja pengguna.
          </DialogDescription>
        </DialogHeader>

        {pengguna ? (
          <PenggunaForm
            key={pengguna.id}
            mode="edit"
            userId={pengguna.id}
            email={pengguna.email}
            defaultValues={updateDefaults}
            isSubmitting={isSubmitting}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync({
                id: pengguna.id,
                values,
              });

              onOpenChange(false);
            }}
          />
        ) : (
          <PenggunaForm
            key="create"
            mode="create"
            defaultValues={createDefaults}
            isSubmitting={isSubmitting}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);

              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
