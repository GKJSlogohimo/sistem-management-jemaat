"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateKeluarga, useUpdateKeluarga } from "../hooks/use-keluarga-mutations";
import type { KeluargaFormValues } from "../schemas/keluarga.schema";
import type { KeluargaListItem } from "../types";
import { KeluargaForm } from "./keluarga-form";

const emptyValues: KeluargaFormValues = {
  unitGerejaId: "",
  nomorKK: "",
  namaKepalaKeluarga: "",
  alamat: "",
  noHp: "",
};

type KeluargaFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keluarga: KeluargaListItem | null;
};

export function KeluargaFormDialog({ open, onOpenChange, keluarga }: KeluargaFormDialogProps) {
  const createMutation = useCreateKeluarga();

  const updateMutation = useUpdateKeluarga();

  const isEdit = Boolean(keluarga);

  const defaultValues: KeluargaFormValues = keluarga
    ? {
        unitGerejaId: keluarga.unitGerejaId,
        nomorKK: keluarga.nomorKK,
        namaKepalaKeluarga: keluarga.namaKepalaKeluarga,
        alamat: keluarga.alamat ?? "",
        noHp: keluarga.noHp ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: KeluargaFormValues) {
    if (keluarga) {
      await updateMutation.mutateAsync({
        id: keluarga.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Keluarga" : "Tambah Keluarga"}</DialogTitle>

          <DialogDescription>
            {isEdit ? "Perbarui informasi keluarga." : "Tambahkan data keluarga baru."}
          </DialogDescription>
        </DialogHeader>

        <KeluargaForm
          key={keluarga?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Simpan perubahan" : "Tambah keluarga"}
        />
      </DialogContent>
    </Dialog>
  );
}
