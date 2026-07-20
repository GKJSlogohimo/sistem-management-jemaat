"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateUnitGereja, useUpdateUnitGereja } from "../hooks/use-unit-gereja-mutations";
import type { UnitGerejaFormValues } from "../schemas/unit-gereja.schema";
import type { UnitGerejaListItem } from "../types";
import { UnitGerejaForm } from "./unit-gereja-form";

const emptyValues: UnitGerejaFormValues = {
  kode: "",
  nama: "",
  jenis: "INDUK",
  parentId: null,
  alamat: "",
  noHp: "",
  email: "",
  penanggungJawab: "",
  aktif: true,
};

type UnitGerejaFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitGerejaListItem | null;
};

export function UnitGerejaFormDialog({ open, onOpenChange, unit }: UnitGerejaFormDialogProps) {
  const createMutation = useCreateUnitGereja();
  const updateMutation = useUpdateUnitGereja();

  const isEdit = Boolean(unit);

  const defaultValues: UnitGerejaFormValues = unit
    ? {
        kode: unit.kode,
        nama: unit.nama,
        jenis: unit.jenis,
        parentId: unit.parentId,
        alamat: unit.alamat ?? "",
        noHp: unit.noHp ?? "",
        email: unit.email ?? "",
        penanggungJawab: unit.penanggungJawab ?? "",
        aktif: unit.aktif,
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: UnitGerejaFormValues) {
    if (unit) {
      await updateMutation.mutateAsync({
        id: unit.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit Gereja" : "Tambah Unit Gereja"}</DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi unit gereja."
              : "Tambahkan unit induk atau subinduk baru."}
          </DialogDescription>
        </DialogHeader>

        <UnitGerejaForm
          key={unit?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Simpan perubahan" : "Tambah unit gereja"}
        />
      </DialogContent>
    </Dialog>
  );
}
