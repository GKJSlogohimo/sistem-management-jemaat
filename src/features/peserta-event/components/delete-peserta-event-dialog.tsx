"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useDeletePesertaEvent } from "../hooks/use-peserta-event-mutations";
import type { PesertaEventListItem } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  peserta: PesertaEventListItem | null;
};

export function DeletePesertaEventDialog({ open, onOpenChange, eventId, peserta }: Props) {
  const mutation = useDeletePesertaEvent(eventId);

  async function handleDelete() {
    if (!peserta) {
      return;
    }

    await mutation.mutateAsync(peserta.id);

    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus peserta?</AlertDialogTitle>

          <AlertDialogDescription>
            Peserta <strong>{peserta?.namaPesertaSnapshot}</strong> akan dihapus dari daftar Event.
            Peserta yang sudah check-in atau menerima antrean tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {mutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
