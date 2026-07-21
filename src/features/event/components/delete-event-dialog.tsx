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

import { useDeleteEvent } from "../hooks/use-event-mutations";
import type { EventListItem } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventListItem | null;
};

export function DeleteEventDialog({ open, onOpenChange, event }: Props) {
  const mutation = useDeleteEvent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Event?</AlertDialogTitle>

          <AlertDialogDescription>
            Event <strong>{event?.nama}</strong> akan disembunyikan. Event yang sudah mempunyai
            peserta tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
            onClick={(clickEvent) => {
              clickEvent.preventDefault();

              if (!event) {
                return;
              }

              void mutation.mutateAsync(event.id).then(() => onOpenChange(false));
            }}
          >
            {mutation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
