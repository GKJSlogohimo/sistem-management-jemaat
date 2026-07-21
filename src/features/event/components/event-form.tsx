"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useKategoriEventOptionsQuery } from "@/features/kategori-event/hooks/use-kategori-event-query";
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";
import { ApiClientError } from "@/lib/api/api-client";

import { eventStatusTransitions, jenisEventOptions, statusEventOptions } from "../constants";
import {
  eventFormSchema,
  type EventFormValues,
  type StatusEventValue,
} from "../schemas/event.schema";

type EventFormProps = {
  defaultValues: EventFormValues;

  currentStatus?: StatusEventValue;

  onSubmit: (values: EventFormValues) => Promise<void>;

  isSubmitting?: boolean;
};

const fieldNames = [
  "unitGerejaId",
  "kategoriEventId",
  "nama",
  "deskripsi",
  "jenis",
  "lokasi",
  "tanggalMulai",
  "tanggalSelesai",
  "kapasitas",
  "status",
  "gunakanPencatatanPeserta",
  "gunakanCheckIn",
  "gunakanAntrean",
  "izinkanNonJemaat",
] as const;

type FieldName = (typeof fieldNames)[number];

export function EventForm({
  defaultValues,
  currentStatus,
  onSubmit,
  isSubmitting = false,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),

    defaultValues,
  });

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const categoryOptions = useKategoriEventOptionsQuery();

  const allowedStatuses = currentStatus
    ? eventStatusTransitions[currentStatus]
    : ["DRAFT", "DIBUKA"];

  async function handleSubmit(values: EventFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiClientError) || !error.fieldErrors) {
        throw error;
      }

      for (const [name, messages] of Object.entries(error.fieldErrors)) {
        if (!fieldNames.includes(name as FieldName)) {
          continue;
        }

        form.setError(name as FieldName, {
          type: "server",
          message: messages[0] ?? "Data tidak valid.",
        });
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="unitGerejaId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Unit Gereja</FieldLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || unitOptions.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Unit Gereja" />
                  </SelectTrigger>

                  <SelectContent>
                    {unitOptions.data?.data.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.kode} — {unit.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="kategoriEventId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Kategori Event</FieldLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || categoryOptions.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>

                  <SelectContent>
                    {categoryOptions.data?.data.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="nama"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nama Event</FieldLabel>

              <Input
                {...field}
                placeholder="Contoh: Pemeriksaan Kesehatan Gratis"
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="jenis"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Jenis Event</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);

                    if (value === "REGISTRASI") {
                      form.setValue("gunakanPencatatanPeserta", true);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {jenisEventOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Status</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statusEventOptions
                      .filter((option) => allowedStatuses.includes(option.value))
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="tanggalMulai"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tanggal mulai</FieldLabel>

                <Input {...field} type="datetime-local" disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="tanggalSelesai"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tanggal selesai</FieldLabel>

                <Input {...field} type="datetime-local" disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="lokasi"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Lokasi</FieldLabel>

                <Input {...field} placeholder="Lokasi pelaksanaan" disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="kapasitas"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Kapasitas</FieldLabel>

                <Input
                  type="number"
                  min={1}
                  value={field.value ?? ""}
                  placeholder="Tidak terbatas"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    field.onChange(event.target.value === "" ? null : Number(event.target.value));
                  }}
                />

                <FieldDescription>Kosongkan apabila kapasitas tidak dibatasi.</FieldDescription>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="deskripsi"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Deskripsi</FieldLabel>

              <Textarea {...field} rows={4} disabled={isSubmitting} />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <p className="font-medium">Konfigurasi operasional</p>

          <Controller
            control={form.control}
            name="gunakanPencatatanPeserta"
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Pencatatan peserta</FieldLabel>

                  <FieldDescription>Menyimpan daftar peserta Event.</FieldDescription>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    if (!checked) {
                      form.setValue("gunakanCheckIn", false);

                      form.setValue("gunakanAntrean", false);

                      form.setValue("izinkanNonJemaat", false);
                    }
                  }}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="gunakanCheckIn"
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Check-in</FieldLabel>

                  <FieldDescription>Petugas mencatat kedatangan peserta.</FieldDescription>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    if (checked) {
                      form.setValue("gunakanPencatatanPeserta", true);
                    } else {
                      form.setValue("gunakanAntrean", false);
                    }
                  }}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="gunakanAntrean"
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Antrean</FieldLabel>

                  <FieldDescription>Memberikan nomor antrean kepada peserta.</FieldDescription>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    if (checked) {
                      form.setValue("gunakanCheckIn", true);

                      form.setValue("gunakanPencatatanPeserta", true);
                    }
                  }}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="izinkanNonJemaat"
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Izinkan nonjemaat</FieldLabel>

                  <FieldDescription>
                    Warga nonjemaat dapat dicatat sebagai peserta.
                  </FieldDescription>
                </div>

                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    if (checked) {
                      form.setValue("gunakanPencatatanPeserta", true);
                    }
                  }}
                />
              </Field>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Event"}
        </Button>
      </FieldGroup>
    </form>
  );
}
