"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateJemaat, useUpdateJemaat } from "../hooks/use-jemaat-mutations";
import type { JemaatFormValues } from "../schemas/jemaat.schema";
import type { JemaatListItem } from "../types";
import { JemaatForm } from "./jemaat-form";

const emptyValues: JemaatFormValues = {
  nomorIndukGereja: "",
  nik: "",
  namaLengkap: "",
  namaPanggilan: "",
  jenisKelamin: "LAKI_LAKI",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noHp: "",
  email: "",
  foto: "",

  status: "AKTIF",
  tanggalTidakAktif: "",
  alasanTidakAktif: null,
  keteranganTidakAktif: "",

  unitGerejaId: "",
  wilayahId: "",
  keluargaId: "",
};

type JemaatFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jemaat: JemaatListItem | null;
};

export function JemaatFormDialog({ open, onOpenChange, jemaat }: JemaatFormDialogProps) {
  const createMutation = useCreateJemaat();
  const updateMutation = useUpdateJemaat();

  const defaultValues: JemaatFormValues = jemaat
    ? {
        nomorIndukGereja: jemaat.nomorIndukGereja,
        nik: jemaat.nik ?? "",
        namaLengkap: jemaat.namaLengkap,
        namaPanggilan: jemaat.namaPanggilan ?? "",
        jenisKelamin: jemaat.jenisKelamin,
        tempatLahir: jemaat.tempatLahir ?? "",
        tanggalLahir: jemaat.tanggalLahir ?? "",
        alamat: jemaat.alamat ?? "",
        noHp: jemaat.noHp ?? "",
        email: jemaat.email ?? "",
        foto: jemaat.foto ?? "",

        status: jemaat.status,
        tanggalTidakAktif: jemaat.tanggalTidakAktif ?? "",
        alasanTidakAktif: jemaat.alasanTidakAktif,
        keteranganTidakAktif: jemaat.keteranganTidakAktif ?? "",

        unitGerejaId: jemaat.unitGerejaId,
        wilayahId: jemaat.wilayahId,
        keluargaId: jemaat.keluargaId,
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: JemaatFormValues) {
    if (jemaat) {
      await updateMutation.mutateAsync({
        id: jemaat.id,
        values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{jemaat ? "Edit Jemaat" : "Tambah Jemaat"}</DialogTitle>

          <DialogDescription>
            Kelola identitas, keluarga, wilayah, dan status keanggotaan jemaat.
          </DialogDescription>
        </DialogHeader>

        <JemaatForm
          key={jemaat?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={jemaat ? "Simpan perubahan" : "Tambah jemaat"}
        />
      </DialogContent>
    </Dialog>
  );
}
