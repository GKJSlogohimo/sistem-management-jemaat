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

import { useDeleteKematian } from "../hooks/use-kematian-mutations";
import type { KematianListItem } from "../types";

type DeleteKematianDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kematian: KematianListItem | null;
};

export function DeleteKematianDialog({ open, onOpenChange, kematian }: DeleteKematianDialogProps) {
  const mutation = useDeleteKematian();

  async function handleDelete() {
    if (!kematian) {
      return;
    }

    await mutation.mutateAsync(kematian.id);

    onOpenChange(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!mutation.isPending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus pencatatan kematian?</AlertDialogTitle>

          <AlertDialogDescription>
            Pencatatan kematian untuk{" "}
            <strong>{kematian?.jemaat.namaLengkap ?? "Jemaat ini"}</strong> akan dihapus. Pencatatan
            yang sudah terverifikasi tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
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
