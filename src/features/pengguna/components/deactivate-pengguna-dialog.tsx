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

import { useDeactivatePengguna } from "../hooks/use-pengguna-mutations";
import type { PenggunaListItem } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengguna: PenggunaListItem | null;
};

export function DeactivatePenggunaDialog({ open, onOpenChange, pengguna }: Props) {
  const mutation = useDeactivatePengguna();

  async function handleDeactivate() {
    if (!pengguna) {
      return;
    }

    await mutation.mutateAsync(pengguna.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nonaktifkan akun?</AlertDialogTitle>

          <AlertDialogDescription>
            Akun <strong>{pengguna?.name}</strong> akan dinonaktifkan dan seluruh sesi login-nya
            akan dicabut.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleDeactivate();
            }}
          >
            {mutation.isPending ? "Menonaktifkan..." : "Nonaktifkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
