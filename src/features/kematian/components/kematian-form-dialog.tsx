"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreateKematian, useUpdateKematian } from "../hooks/use-kematian-mutations";
import type { KematianFormValues } from "../schemas/kematian.schema";
import type { KematianListItem } from "../types";
import { KematianForm } from "./kematian-form";

const emptyValues: KematianFormValues = {
  jemaatId: "",

  tanggalMeninggal: "",
  waktuMeninggal: "",
  tempatMeninggal: "",
  penyebabKematian: "",

  nomorSuratKematian: "",
  instansiPenerbit: "",
  dokumenSuratKematian: "",
  alamatRumahDuka: "",

  tanggalIbadahPenghiburan: "",
  waktuIbadahPenghiburan: "",
  lokasiIbadahPenghiburan: "",
  namaPelayanPenghiburan: "",
  temaPelayanan: "",
  catatanPelayanan: "",

  tanggalPemakaman: "",
  waktuPemakaman: "",
  lokasiPemakaman: "",
  namaTempatPemakaman: "",
  namaPelayanPemakaman: "",
  nomorLokasiMakam: "",
  keteranganPemakaman: "",

  status: "DRAFT",
  keterangan: "",
};

type KematianFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kematian: KematianListItem | null;
};

export function KematianFormDialog({ open, onOpenChange, kematian }: KematianFormDialogProps) {
  const createMutation = useCreateKematian();

  const updateMutation = useUpdateKematian();

  const defaultValues: KematianFormValues = kematian
    ? {
        jemaatId: kematian.jemaatId,

        tanggalMeninggal: kematian.tanggalMeninggal,

        waktuMeninggal: kematian.waktuMeninggal ?? "",

        tempatMeninggal: kematian.tempatMeninggal ?? "",

        penyebabKematian: kematian.penyebabKematian ?? "",

        nomorSuratKematian: kematian.nomorSuratKematian ?? "",

        instansiPenerbit: kematian.instansiPenerbit ?? "",

        dokumenSuratKematian: kematian.dokumenSuratKematian ?? "",

        alamatRumahDuka: kematian.alamatRumahDuka ?? "",

        tanggalIbadahPenghiburan: kematian.tanggalIbadahPenghiburan ?? "",

        waktuIbadahPenghiburan: kematian.waktuIbadahPenghiburan ?? "",

        lokasiIbadahPenghiburan: kematian.lokasiIbadahPenghiburan ?? "",

        namaPelayanPenghiburan: kematian.namaPelayanPenghiburan ?? "",

        temaPelayanan: kematian.temaPelayanan ?? "",

        catatanPelayanan: kematian.catatanPelayanan ?? "",

        tanggalPemakaman: kematian.tanggalPemakaman ?? "",

        waktuPemakaman: kematian.waktuPemakaman ?? "",

        lokasiPemakaman: kematian.lokasiPemakaman ?? "",

        namaTempatPemakaman: kematian.namaTempatPemakaman ?? "",

        namaPelayanPemakaman: kematian.namaPelayanPemakaman ?? "",

        nomorLokasiMakam: kematian.nomorLokasiMakam ?? "",

        keteranganPemakaman: kematian.keteranganPemakaman ?? "",

        status: kematian.status,

        keterangan: kematian.keterangan ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: KematianFormValues) {
    if (kematian) {
      await updateMutation.mutateAsync({
        id: kematian.id,
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {kematian ? "Edit Pencatatan Kematian" : "Tambah Pencatatan Kematian"}
          </DialogTitle>

          <DialogDescription>
            Status terverifikasi akan menonaktifkan Jemaat secara permanen dengan alasan meninggal.
          </DialogDescription>
        </DialogHeader>

        <KematianForm
          key={kematian?.id ?? "create"}
          kematian={kematian}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={kematian ? "Simpan perubahan" : "Tambah pencatatan"}
        />
      </DialogContent>
    </Dialog>
  );
}
