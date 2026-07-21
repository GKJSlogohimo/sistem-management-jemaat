/* eslint-disable react-hooks/incompatible-library */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

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
import { ApiClientError } from "@/lib/api/api-client";

import { getKategoriEventIcon, kategoriEventIconOptions } from "../constants";
import {
  kategoriEventFormSchema,
  type KategoriEventFormValues,
} from "../schemas/kategori-event.schema";

type KategoriEventFormProps = {
  defaultValues: KategoriEventFormValues;

  onSubmit: (values: KategoriEventFormValues) => Promise<void>;

  isSubmitting?: boolean;
  submitLabel: string;
};

const formFieldNames = ["nama", "ikon", "warna", "deskripsi", "aktif"] as const;

type FormFieldName = (typeof formFieldNames)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFieldNames.includes(value as FormFieldName);
}

export function KategoriEventForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: KategoriEventFormProps) {
  const form = useForm<KategoriEventFormValues>({
    resolver: zodResolver(kategoriEventFormSchema),
    defaultValues,
  });

  const selectedIcon = useWatch({
    control: form.control,
    name: "ikon",
  });

  const selectedColor = useWatch({
    control: form.control,
    name: "warna",
  });

  const PreviewIcon = getKategoriEventIcon(selectedIcon);

  async function handleSubmit(values: KategoriEventFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiClientError) || !error.fieldErrors) {
        throw error;
      }

      for (const [fieldName, messages] of Object.entries(error.fieldErrors)) {
        if (!isFormFieldName(fieldName)) {
          continue;
        }

        form.setError(fieldName, {
          type: "server",
          message: messages[0] ?? "Data tidak valid.",
        });
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={form.control}
          name="nama"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama kategori</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Contoh: Pemeriksaan Kesehatan"
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="ikon"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Ikon</FieldLabel>

                <Select
                  value={field.value ?? "none"}
                  disabled={isSubmitting}
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? null : value);
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih ikon" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">Tanpa ikon</SelectItem>

                    {kategoriEventIconOptions.map((option) => {
                      const Icon = getKategoriEventIcon(option.value);

                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {option.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="warna"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Warna</FieldLabel>

                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={field.value || "#64748B"}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    className="h-10 w-14 shrink-0 p-1"
                    aria-label="Pilih warna"
                  />

                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="#2563EB"
                    disabled={isSubmitting}
                    maxLength={7}
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      field.onChange(event.target.value.toUpperCase());
                    }}
                  />

                  {field.value ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Hapus
                    </Button>
                  ) : null}
                </div>

                <FieldDescription>Warna menggunakan format HEX.</FieldDescription>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Pratinjau</p>

          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-md text-white"
              style={{
                backgroundColor: selectedColor || "#64748B",
              }}
            >
              <PreviewIcon className="size-5" />
            </div>

            <div>
              <p className="font-medium">{form.watch("nama") || "Nama kategori"}</p>

              <p className="text-xs text-muted-foreground">Tampilan kategori pada daftar Event</p>
            </div>
          </div>
        </div>

        <Controller
          control={form.control}
          name="deskripsi"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                rows={4}
                placeholder="Jelaskan penggunaan kategori ini"
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />

              <FieldDescription>Opsional, maksimal 500 karakter.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="aktif"
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel htmlFor={field.name}>Kategori aktif</FieldLabel>

                <FieldDescription>
                  Hanya kategori aktif yang dapat dipilih saat membuat Event.
                </FieldDescription>
              </div>

              <Switch
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
