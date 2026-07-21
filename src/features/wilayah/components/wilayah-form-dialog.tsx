"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateWilayah, useUpdateWilayah } from "../hooks/use-wilayah-mutations";
import type { WilayahFormValues } from "../schemas/wilayah.schema";
import type { WilayahListItem } from "../types";
import { WilayahForm } from "./wilayah-form";

const emptyValues: WilayahFormValues = {
  unitGerejaId: "",
  nama: "",
  keterangan: "",
};

type WilayahFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wilayah: WilayahListItem | null;
};

export function WilayahFormDialog({ open, onOpenChange, wilayah }: WilayahFormDialogProps) {
  const createMutation = useCreateWilayah();
  const updateMutation = useUpdateWilayah();

  const isEdit = Boolean(wilayah);

  const defaultValues: WilayahFormValues = wilayah
    ? {
        unitGerejaId: wilayah.unitGerejaId,
        nama: wilayah.nama,
        keterangan: wilayah.keterangan ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: WilayahFormValues) {
    if (wilayah) {
      await updateMutation.mutateAsync({
        id: wilayah.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Wilayah" : "Tambah Wilayah"}</DialogTitle>

          <DialogDescription>
            {isEdit ? "Perbarui informasi wilayah." : "Tambahkan wilayah baru pada unit gereja."}
          </DialogDescription>
        </DialogHeader>

        <WilayahForm
          key={wilayah?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Simpan perubahan" : "Tambah wilayah"}
        />
      </DialogContent>
    </Dialog>
  );
}
