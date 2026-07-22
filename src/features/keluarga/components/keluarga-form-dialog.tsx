"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateKeluarga, useUpdateKeluarga } from "../hooks/use-keluarga-mutations";
import type {
  CreateKeluargaInput,
  KeluargaFormValues,
  UpdateKeluargaInput,
} from "../schemas/keluarga.schema";
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
  canViewNomorKK: boolean;
};

export function KeluargaFormDialog({
  open,
  onOpenChange,
  keluarga,
  canViewNomorKK,
}: KeluargaFormDialogProps) {
  const createMutation = useCreateKeluarga();

  const updateMutation = useUpdateKeluarga();

  const mode = keluarga ? "edit" : "create";

  const isEdit = mode === "edit";

  const defaultValues: KeluargaFormValues = keluarga
    ? {
        unitGerejaId: keluarga.unitGerejaId,

        /*
         * API mengembalikan null untuk
         * role tanpa izin nomor KK.
         */
        nomorKK: keluarga.nomorKK ?? "",

        namaKepalaKeluarga: keluarga.namaKepalaKeluarga,

        alamat: keluarga.alamat ?? "",

        noHp: keluarga.noHp ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: KeluargaFormValues) {
    if (keluarga) {
      const payload: UpdateKeluargaInput = {
        unitGerejaId: values.unitGerejaId,

        namaKepalaKeluarga: values.namaKepalaKeluarga,

        alamat: values.alamat,

        noHp: values.noHp,

        /*
         * Hanya kirim nomorKK ketika
         * actor berhak melihat dan
         * mengubahnya.
         */
        ...(canViewNomorKK && values.nomorKK
          ? {
              nomorKK: values.nomorKK,
            }
          : {}),
      };

      await updateMutation.mutateAsync({
        id: keluarga.id,
        values: payload,
      });
    } else {
      /*
       * Pada create, nomor KK wajib ada.
       * Schema form memastikan nilainya
       * terdiri dari 16 digit.
       */
      const payload: CreateKeluargaInput = {
        unitGerejaId: values.unitGerejaId,

        nomorKK: values.nomorKK,

        namaKepalaKeluarga: values.namaKepalaKeluarga,

        alamat: values.alamat,

        noHp: values.noHp,
      };

      await createMutation.mutateAsync(payload);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Keluarga" : "Tambah Keluarga"}</DialogTitle>

          <DialogDescription>
            {isEdit ? "Perbarui informasi keluarga." : "Tambahkan data keluarga baru."}
          </DialogDescription>
        </DialogHeader>

        <KeluargaForm
          key={[keluarga?.id ?? "create", canViewNomorKK ? "show-kk" : "hide-kk"].join("-")}
          mode={mode}
          canViewNomorKK={canViewNomorKK}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Simpan perubahan" : "Tambah keluarga"}
        />
      </DialogContent>
    </Dialog>
  );
}
