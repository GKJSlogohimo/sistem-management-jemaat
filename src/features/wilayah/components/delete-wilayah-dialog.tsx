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

import { useDeleteWilayah } from "../hooks/use-wilayah-mutations";
import type { WilayahListItem } from "../types";

type DeleteWilayahDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wilayah: WilayahListItem | null;
};

export function DeleteWilayahDialog({ open, onOpenChange, wilayah }: DeleteWilayahDialogProps) {
  const deleteMutation = useDeleteWilayah();

  async function handleDelete() {
    if (!wilayah) {
      return;
    }

    await deleteMutation.mutateAsync(wilayah.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus wilayah?</AlertDialogTitle>

          <AlertDialogDescription>
            Wilayah <strong>{wilayah?.nama}</strong> akan disembunyikan dari daftar. Wilayah yang
            sudah mempunyai data jemaat tidak dapat dihapus.
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
