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

import { useDeletePernikahan } from "../hooks/use-pernikahan-mutations";
import type { PernikahanListItem } from "../types";

type DeletePernikahanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pernikahan: PernikahanListItem | null;
};

export function DeletePernikahanDialog({
  open,
  onOpenChange,
  pernikahan,
}: DeletePernikahanDialogProps) {
  const mutation = useDeletePernikahan();

  async function handleDelete() {
    if (!pernikahan) {
      return;
    }

    await mutation.mutateAsync(pernikahan.id);

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
          <AlertDialogTitle>Hapus data Pernikahan?</AlertDialogTitle>

          <AlertDialogDescription>
            Pencatatan pernikahan{" "}
            <strong>
              {pernikahan ? `${pernikahan.namaPihakSatu} dan ${pernikahan.namaPihakDua}` : "ini"}
            </strong>{" "}
            akan dihapus dari daftar.
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
