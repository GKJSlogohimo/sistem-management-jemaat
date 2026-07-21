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
import { ApiClientError } from "@/lib/api/api-client";

import { useUnitGerejaOptionsQuery } from "../hooks/use-wilayah-query";
import { wilayahFormSchema, type WilayahFormValues } from "../schemas/wilayah.schema";

type WilayahFormProps = {
  defaultValues: WilayahFormValues;
  onSubmit: (values: WilayahFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

export function WilayahForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: WilayahFormProps) {
  const form = useForm<WilayahFormValues>({
    resolver: zodResolver(wilayahFormSchema),
    defaultValues,
  });

  const unitOptionsQuery = useUnitGerejaOptionsQuery();

  async function handleSubmit(values: WilayahFormValues) {
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
        if (fieldName !== "unitGerejaId" && fieldName !== "nama" && fieldName !== "keterangan") {
          continue;
        }

        form.setError(fieldName, {
          type: "server",
          message: messages[0] ?? "Data pada field ini tidak valid.",
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
          name="nama"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama wilayah</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Contoh: Wilayah I"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Nama harus unik dalam unit gereja yang dipilih.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="keterangan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Keterangan</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                rows={4}
                placeholder="Keterangan tambahan mengenai wilayah"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, maksimal 500 karakter.</FieldDescription>

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
