"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateBaptisan, useUpdateBaptisan } from "../hooks/use-baptisan-mutations";
import type { BaptisanFormValues } from "../schemas/baptisan.schema";
import type { BaptisanListItem } from "../types";
import { BaptisanForm } from "./baptisan-form";

const emptyValues: BaptisanFormValues = {
  jemaatId: "",
  jenis: "BAPTIS_ANAK",
  tanggalBaptisan: "",
  tempatBaptisan: "",
  namaPelayan: "",
  nomorSertifikat: "",
  dokumen: "",
  keterangan: "",
};

type BaptisanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baptisan: BaptisanListItem | null;
};

export function BaptisanFormDialog({ open, onOpenChange, baptisan }: BaptisanFormDialogProps) {
  const createMutation = useCreateBaptisan();
  const updateMutation = useUpdateBaptisan();

  const isEdit = Boolean(baptisan);

  const defaultValues: BaptisanFormValues = baptisan
    ? {
        jemaatId: baptisan.jemaatId,
        jenis: baptisan.jenis,
        tanggalBaptisan: baptisan.tanggalBaptisan,
        tempatBaptisan: baptisan.tempatBaptisan ?? "",
        namaPelayan: baptisan.namaPelayan ?? "",
        nomorSertifikat: baptisan.nomorSertifikat ?? "",
        dokumen: baptisan.dokumen ?? "",
        keterangan: baptisan.keterangan ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: BaptisanFormValues) {
    if (baptisan) {
      await updateMutation.mutateAsync({
        id: baptisan.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Baptisan" : "Tambah Baptisan"}</DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui data Baptisan atau Sidi."
              : "Tambahkan pencatatan Baptisan atau Sidi untuk jemaat."}
          </DialogDescription>
        </DialogHeader>

        <BaptisanForm
          key={baptisan?.id ?? "create"}
          baptisan={baptisan}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Simpan perubahan" : "Tambah Baptisan"}
        />
      </DialogContent>
    </Dialog>
  );
}
