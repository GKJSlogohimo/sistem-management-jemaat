"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useCreateKategoriEvent,
  useUpdateKategoriEvent,
} from "../hooks/use-kategori-event-mutations";
import type { KategoriEventFormValues } from "../schemas/kategori-event.schema";
import type { KategoriEventListItem } from "../types";
import { KategoriEventForm } from "./kategori-event-form";

const emptyValues: KategoriEventFormValues = {
  nama: "",
  ikon: "CalendarDays",
  warna: "#2563EB",
  deskripsi: "",
  aktif: true,
};

type KategoriEventFormDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  kategori: KategoriEventListItem | null;
};

export function KategoriEventFormDialog({
  open,
  onOpenChange,
  kategori,
}: KategoriEventFormDialogProps) {
  const createMutation = useCreateKategoriEvent();

  const updateMutation = useUpdateKategoriEvent();

  const defaultValues: KategoriEventFormValues = kategori
    ? {
        nama: kategori.nama,

        ikon:
          kategori.ikon &&
          [
            "CalendarDays",
            "Church",
            "HeartPulse",
            "GraduationCap",
            "Users",
            "Baby",
            "HandHeart",
            "BookOpen",
            "Music",
            "PartyPopper",
          ].includes(kategori.ikon)
            ? (kategori.ikon as KategoriEventFormValues["ikon"])
            : null,

        warna: kategori.warna ?? "",

        deskripsi: kategori.deskripsi ?? "",

        aktif: kategori.aktif,
      }
    : emptyValues;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: KategoriEventFormValues) {
    if (kategori) {
      await updateMutation.mutateAsync({
        id: kategori.id,
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
          <DialogTitle>{kategori ? "Edit Kategori Event" : "Tambah Kategori Event"}</DialogTitle>

          <DialogDescription>
            Kelola nama, ikon, warna, dan status Kategori Event.
          </DialogDescription>
        </DialogHeader>

        <KategoriEventForm
          key={kategori?.id ?? "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={kategori ? "Simpan perubahan" : "Tambah kategori"}
        />
      </DialogContent>
    </Dialog>
  );
}
