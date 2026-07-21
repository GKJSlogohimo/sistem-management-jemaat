"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCreatePesertaEvent, useUpdatePesertaEvent } from "../hooks/use-peserta-event-mutations";
import type { PesertaEventFormValues } from "../schemas/peserta-event.schema";
import type { PesertaEventListItem } from "../types";
import { PesertaEventForm } from "./peserta-event-form";

const emptyValues: PesertaEventFormValues = {
  jenisPeserta: "JEMAAT",
  jemaatId: "",
  nik: "",
  namaLengkap: "",
  jenisKelamin: null,
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noHp: "",
  email: "",
  keterangan: "",
  catatan: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  izinkanNonJemaat: boolean;
  peserta: PesertaEventListItem | null;
};

export function PesertaEventFormDialog({
  open,
  onOpenChange,
  eventId,
  izinkanNonJemaat,
  peserta,
}: Props) {
  const createMutation = useCreatePesertaEvent(eventId);

  const updateMutation = useUpdatePesertaEvent(eventId);

  const defaultValues: PesertaEventFormValues = peserta
    ? {
        jenisPeserta: peserta.jenisPeserta,

        jemaatId: peserta.jemaatId ?? "",

        nik: peserta.sumber.nik ?? "",

        namaLengkap: peserta.sumber.namaLengkap,

        jenisKelamin: peserta.sumber.jenisKelamin,

        tempatLahir: peserta.sumber.tempatLahir ?? "",

        tanggalLahir: peserta.sumber.tanggalLahir ?? "",

        alamat: peserta.sumber.alamat ?? "",

        noHp: peserta.sumber.noHp ?? "",

        email: peserta.sumber.email ?? "",

        keterangan: "",

        catatan: peserta.catatan ?? "",
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{peserta ? "Edit Peserta" : "Tambah Peserta"}</DialogTitle>

          <DialogDescription>
            Daftarkan Jemaat atau warga nonjemaat sebagai peserta Event.
          </DialogDescription>
        </DialogHeader>

        <PesertaEventForm
          key={peserta?.id ?? "create"}
          eventId={eventId}
          izinkanNonJemaat={izinkanNonJemaat}
          peserta={peserta}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          onSubmit={async (values) => {
            if (peserta) {
              await updateMutation.mutateAsync({
                pesertaId: peserta.id,
                values,
              });
            } else {
              await createMutation.mutateAsync(values);
            }

            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
