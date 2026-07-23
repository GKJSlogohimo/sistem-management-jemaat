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

import { useDeleteBaptisan } from "../hooks/use-baptisan-mutations";
import type { BaptisanListItem } from "../types";

type BaptisanDeleteDialogProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  baptisan: BaptisanListItem | null;
};

export function BaptisanDeleteDialog({ open, onOpenChange, baptisan }: BaptisanDeleteDialogProps) {
  const mutation = useDeleteBaptisan();

  async function handleDelete() {
    if (!baptisan) {
      return;
    }

    await mutation.mutateAsync(baptisan.id);

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
          <AlertDialogTitle>Hapus data Baptisan?</AlertDialogTitle>

          <AlertDialogDescription>
            Pencatatan milik <strong>{baptisan?.jemaat.namaLengkap ?? "jemaat ini"}</strong> akan
            dihapus dari daftar. Data menggunakan soft delete.
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
