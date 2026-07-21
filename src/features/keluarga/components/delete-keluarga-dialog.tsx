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

import { useDeleteKeluarga } from "../hooks/use-keluarga-mutations";
import type { KeluargaListItem } from "../types";

type DeleteKeluargaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keluarga: KeluargaListItem | null;
};

export function DeleteKeluargaDialog({ open, onOpenChange, keluarga }: DeleteKeluargaDialogProps) {
  const deleteMutation = useDeleteKeluarga();

  async function handleDelete() {
    if (!keluarga) {
      return;
    }

    await deleteMutation.mutateAsync(keluarga.id);

    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data keluarga?</AlertDialogTitle>

          <AlertDialogDescription>
            Keluarga <strong>{keluarga?.namaKepalaKeluarga}</strong> dengan nomor KK{" "}
            <strong>{keluarga?.nomorKK}</strong> akan disembunyikan dari daftar. Keluarga yang sudah
            mempunyai anggota jemaat tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
            disabled={deleteMutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
