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
import { Textarea } from "@/components/ui/textarea";
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";
import { ApiClientError } from "@/lib/api/api-client";

import { keluargaFormSchema, type KeluargaFormValues } from "../schemas/keluarga.schema";

type KeluargaFormProps = {
  defaultValues: KeluargaFormValues;
  onSubmit: (values: KeluargaFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

const formFieldNames = ["unitGerejaId", "nomorKK", "namaKepalaKeluarga", "alamat", "noHp"] as const;

type FormFieldName = (typeof formFieldNames)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFieldNames.includes(value as FormFieldName);
}

export function KeluargaForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: KeluargaFormProps) {
  const form = useForm<KeluargaFormValues>({
    resolver: zodResolver(keluargaFormSchema),
    defaultValues,
  });

  const unitOptionsQuery = useActiveUnitGerejaOptionsQuery();

  async function handleSubmit(values: KeluargaFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        throw error;
      }

      if (!error.fieldErrors) {
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
          name="unitGerejaId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Unit gereja</FieldLabel>

              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isSubmitting || unitOptionsQuery.isPending}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Pilih unit gereja" />
                </SelectTrigger>

                <SelectContent>
                  {unitOptionsQuery.data?.data.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.kode} — {unit.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {unitOptionsQuery.isError ? (
                <FieldDescription className="text-destructive">
                  Daftar unit gereja tidak dapat dimuat.
                </FieldDescription>
              ) : null}

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="nomorKK"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nomor KK</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={16}
                placeholder="16 digit nomor KK"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 16);

                  field.onChange(value);
                }}
              />

              <FieldDescription>
                Masukkan tepat 16 digit angka sesuai Kartu Keluarga.
              </FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="namaKepalaKeluarga"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama kepala keluarga</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Masukkan nama kepala keluarga"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="alamat"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Alamat</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                rows={4}
                placeholder="Masukkan alamat keluarga"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, maksimal 500 karakter.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="noHp"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nomor HP</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="tel"
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || unitOptionsQuery.isPending || unitOptionsQuery.isError}
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
