"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toJakartaDateTimeInput } from "../constants";
import { useCreateEvent, useUpdateEvent } from "../hooks/use-event-mutations";
import type { EventFormValues } from "../schemas/event.schema";
import type { EventListItem } from "../types";
import { EventForm } from "./event-form";

const emptyValues: EventFormValues = {
  unitGerejaId: "",
  kategoriEventId: "",
  nama: "",
  deskripsi: "",
  jenis: "UMUM",
  lokasi: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  kapasitas: null,
  status: "DRAFT",
  gunakanPencatatanPeserta: false,
  gunakanCheckIn: false,
  gunakanAntrean: false,
  izinkanNonJemaat: false,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventListItem | null;
};

export function EventFormDialog({ open, onOpenChange, event }: Props) {
  const createMutation = useCreateEvent();

  const updateMutation = useUpdateEvent();

  const defaultValues: EventFormValues = event
    ? {
        unitGerejaId: event.unitGerejaId,

        kategoriEventId: event.kategoriEventId,

        nama: event.nama,

        deskripsi: event.deskripsi ?? "",

        jenis: event.jenis,

        lokasi: event.lokasi ?? "",

        tanggalMulai: toJakartaDateTimeInput(event.tanggalMulai),

        tanggalSelesai: event.tanggalSelesai ? toJakartaDateTimeInput(event.tanggalSelesai) : "",

        kapasitas: event.kapasitas,

        status: event.status,

        gunakanPencatatanPeserta: event.gunakanPencatatanPeserta,

        gunakanCheckIn: event.gunakanCheckIn,

        gunakanAntrean: event.gunakanAntrean,

        izinkanNonJemaat: event.izinkanNonJemaat,
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Tambah Event"}</DialogTitle>

          <DialogDescription>Atur jadwal, peserta, check-in, dan antrean Event.</DialogDescription>
        </DialogHeader>

        <EventForm
          key={event?.id ?? "create"}
          defaultValues={defaultValues}
          currentStatus={event?.status}
          isSubmitting={isSubmitting}
          onSubmit={async (values) => {
            if (event) {
              await updateMutation.mutateAsync({
                id: event.id,
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
