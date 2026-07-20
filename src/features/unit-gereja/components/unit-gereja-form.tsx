"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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

import { jenisUnitGerejaOptions } from "../constants";
import { useUnitGerejaOptionsQuery } from "../hooks/use-unit-gereja-query";
import { unitGerejaFormSchema, type UnitGerejaFormValues } from "../schemas/unit-gereja.schema";

type UnitGerejaFormProps = {
  defaultValues: UnitGerejaFormValues;
  onSubmit: (values: UnitGerejaFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

export function UnitGerejaForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: UnitGerejaFormProps) {
  const form = useForm<UnitGerejaFormValues>({
    resolver: zodResolver(unitGerejaFormSchema),
    defaultValues,
  });

  const jenis = useWatch({
    control: form.control,
    name: "jenis",
  });

  const parentOptionsQuery = useUnitGerejaOptionsQuery(jenis === "SUB_INDUK");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="kode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Kode</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Contoh: INDUK"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    field.onChange(event.target.value.toUpperCase());
                  }}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="jenis"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Jenis unit</FieldLabel>

                <Select
                  value={field.value}
                  disabled={isSubmitting}
                  onValueChange={(value) => {
                    field.onChange(value);

                    if (value === "INDUK") {
                      form.setValue("parentId", null, {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih jenis unit" />
                  </SelectTrigger>

                  <SelectContent>
                    {jenisUnitGerejaOptions.map((option) => (
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

        <Controller
          control={form.control}
          name="nama"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama unit gereja</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Masukkan nama unit gereja"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        {jenis === "SUB_INDUK" ? (
          <Controller
            control={form.control}
            name="parentId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Unit gereja induk</FieldLabel>

                <Select
                  value={field.value ?? undefined}
                  disabled={isSubmitting || parentOptionsQuery.isPending}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih unit induk" />
                  </SelectTrigger>

                  <SelectContent>
                    {parentOptionsQuery.data?.data.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.kode} — {option.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!parentOptionsQuery.isPending && !parentOptionsQuery.data?.data.length ? (
                  <FieldDescription>Buat unit gereja induk terlebih dahulu.</FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        ) : null}

        <Controller
          control={form.control}
          name="alamat"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Alamat</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                placeholder="Masukkan alamat unit gereja"
                rows={3}
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="noHp"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nomor HP</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="08xxxxxxxxxx"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="unit@email.com"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="penanggungJawab"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Penanggung jawab</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Nama penanggung jawab"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="aktif"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Status aktif</FieldLabel>

                <FieldDescription>Unit aktif dapat digunakan pada modul lain.</FieldDescription>
              </FieldContent>

              <Switch
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
