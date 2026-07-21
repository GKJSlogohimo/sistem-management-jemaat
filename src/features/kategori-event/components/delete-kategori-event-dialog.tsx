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

import { useDeleteKategoriEvent } from "../hooks/use-kategori-event-mutations";
import type { KategoriEventListItem } from "../types";

type DeleteKategoriEventDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  kategori: KategoriEventListItem | null;
};

export function DeleteKategoriEventDialog({
  open,
  onOpenChange,
  kategori,
}: DeleteKategoriEventDialogProps) {
  const mutation = useDeleteKategoriEvent();

  async function handleDelete() {
    if (!kategori) {
      return;
    }

    await mutation.mutateAsync(kategori.id);

    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kategori Event?</AlertDialogTitle>

          <AlertDialogDescription>
            Kategori <strong>{kategori?.nama}</strong> akan disembunyikan dari daftar. Kategori yang
            sudah digunakan Event tidak dapat dihapus dan harus dinonaktifkan.
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
