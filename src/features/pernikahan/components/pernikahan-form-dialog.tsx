"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreatePernikahan, useUpdatePernikahan } from "../hooks/use-pernikahan-mutations";
import type { PernikahanFormValues } from "../schemas/pernikahan.schema";
import type { PernikahanListItem } from "../types";
import { PernikahanForm } from "./pernikahan-form";

const emptyValues: PernikahanFormValues = {
  unitGerejaId: "",
  nomorPencatatan: "",
  nomorSertifikat: "",
  tanggalPernikahan: "",
  tempatPernikahan: "",
  namaPelayan: "",
  jemaatPihakSatuId: "",
  namaPihakSatu: "",
  jemaatPihakDuaId: "",
  namaPihakDua: "",
  namaSaksiSatu: "",
  namaSaksiDua: "",
  dokumen: "",
  keterangan: "",
};

type PernikahanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pernikahan: PernikahanListItem | null;
};

export function PernikahanFormDialog({
  open,
  onOpenChange,
  pernikahan,
}: PernikahanFormDialogProps) {
  const createMutation = useCreatePernikahan();
  const updateMutation = useUpdatePernikahan();

  const defaultValues: PernikahanFormValues = pernikahan
    ? {
        unitGerejaId: pernikahan.unitGerejaId,
        nomorPencatatan: pernikahan.nomorPencatatan ?? "",
        nomorSertifikat: pernikahan.nomorSertifikat ?? "",
        tanggalPernikahan: pernikahan.tanggalPernikahan,
        tempatPernikahan: pernikahan.tempatPernikahan ?? "",
        namaPelayan: pernikahan.namaPelayan ?? "",
        jemaatPihakSatuId: pernikahan.jemaatPihakSatuId ?? "",
        namaPihakSatu: pernikahan.namaPihakSatu,
        jemaatPihakDuaId: pernikahan.jemaatPihakDuaId ?? "",
        namaPihakDua: pernikahan.namaPihakDua,
        namaSaksiSatu: pernikahan.namaSaksiSatu ?? "",
        namaSaksiDua: pernikahan.namaSaksiDua ?? "",
        dokumen: pernikahan.dokumen ?? "",
        keterangan: pernikahan.keterangan ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: PernikahanFormValues) {
    if (pernikahan) {
      await updateMutation.mutateAsync({
        id: pernikahan.id,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{pernikahan ? "Edit Pernikahan" : "Tambah Pernikahan"}</DialogTitle>

          <DialogDescription>
            Minimal salah satu pihak harus berasal dari data Jemaat.
          </DialogDescription>
        </DialogHeader>

        <PernikahanForm
          key={pernikahan?.id ?? "create"}
          pernikahan={pernikahan}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={pernikahan ? "Simpan perubahan" : "Tambah Pernikahan"}
        />
      </DialogContent>
    </Dialog>
  );
}
