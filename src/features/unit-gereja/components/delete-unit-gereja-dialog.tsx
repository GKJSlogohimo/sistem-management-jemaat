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

import { useDeleteUnitGereja } from "../hooks/use-unit-gereja-mutations";
import type { UnitGerejaListItem } from "../types";

type DeleteUnitGerejaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitGerejaListItem | null;
};

export function DeleteUnitGerejaDialog({ open, onOpenChange, unit }: DeleteUnitGerejaDialogProps) {
  const deleteMutation = useDeleteUnitGereja();

  async function handleDelete() {
    if (!unit) {
      return;
    }

    await deleteMutation.mutateAsync(unit.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus unit gereja?</AlertDialogTitle>

          <AlertDialogDescription>
            Unit <strong>{unit?.nama}</strong> akan dinonaktifkan dan disembunyikan dari daftar.
            Tindakan ini ditolak jika unit masih mempunyai data terkait.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
