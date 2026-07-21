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

import { useDeleteJemaat } from "../hooks/use-jemaat-mutations";
import type { JemaatListItem } from "../types";

type DeleteJemaatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jemaat: JemaatListItem | null;
};

export function DeleteJemaatDialog({ open, onOpenChange, jemaat }: DeleteJemaatDialogProps) {
  const mutation = useDeleteJemaat();

  async function handleDelete() {
    if (!jemaat) {
      return;
    }

    await mutation.mutateAsync(jemaat.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data jemaat?</AlertDialogTitle>

          <AlertDialogDescription>
            Data <strong>{jemaat?.namaLengkap}</strong> akan disembunyikan. Jemaat yang sudah
            mempunyai riwayat terkait tidak dapat dihapus dan harus diubah menjadi tidak aktif.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
