"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientError } from "@/lib/api/api-client";

import { useOperasionalEventMutation } from "../hooks/use-operasional-event";
import type { OperasionalParticipant } from "../types";

type Props = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  eventId: string;
  gunakanAntrean: boolean;

  nomorAntrianBerikutnya: number;

  peserta: OperasionalParticipant | null;
};

export function CheckInDialog({
  open,
  onOpenChange,
  eventId,
  gunakanAntrean,
  nomorAntrianBerikutnya,
  peserta,
}: Props) {
  const mutation = useOperasionalEventMutation(eventId);

  const [nomorAntrian, setNomorAntrian] = useState(nomorAntrianBerikutnya);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!peserta) {
      return;
    }

    if (gunakanAntrean && (!Number.isInteger(nomorAntrian) || nomorAntrian <= 0)) {
      setError("Nomor antrean harus berupa angka positif.");

      return;
    }

    setError(null);

    try {
      await mutation.mutateAsync({
        action: "CHECK_IN",

        pesertaId: peserta.id,

        nomorAntrian: gunakanAntrean ? nomorAntrian : null,
      });

      onOpenChange(false);
    } catch (mutationError) {
      if (mutationError instanceof ApiClientError && mutationError.fieldErrors?.nomorAntrian) {
        setError(mutationError.fieldErrors.nomorAntrian[0] ?? "Nomor antrean tidak valid.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in peserta</DialogTitle>

          <DialogDescription>
            Konfirmasi kedatangan <strong>{peserta?.nama}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="font-medium">{peserta?.nama}</p>

            <p className="text-sm text-muted-foreground">
              {peserta?.nik
                ? `NIK ${peserta.nik}`
                : peserta?.jenisPeserta === "JEMAAT"
                  ? "Peserta Jemaat"
                  : "Peserta nonjemaat"}
            </p>
          </div>

          {gunakanAntrean ? (
            <div className="space-y-2">
              <Label htmlFor="nomorAntrian">Nomor antrean</Label>

              <Input
                id="nomorAntrian"
                type="number"
                min={1}
                value={nomorAntrian}
                onChange={(event) => {
                  setNomorAntrian(Number(event.target.value));

                  setError(null);
                }}
              />

              <p className="text-xs text-muted-foreground">
                Nomor berikutnya yang disarankan: {nomorAntrianBerikutnya}
              </p>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Event ini tidak menggunakan antrean. Peserta akan berstatus Hadir setelah check-in.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {mutation.isPending ? "Memproses..." : "Check-in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
