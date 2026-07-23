"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";

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

import { useJemaatPernikahanOptionsQuery } from "../hooks/use-pernikahan-query";
import { createPernikahanSchema, type PernikahanFormValues } from "../schemas/pernikahan.schema";
import type { JemaatPernikahanOption, PernikahanListItem } from "../types";

const EXTERNAL_PARTY_VALUE = "__external__";

const formFieldNames = [
  "unitGerejaId",
  "nomorPencatatan",
  "nomorSertifikat",
  "tanggalPernikahan",
  "tempatPernikahan",
  "namaPelayan",
  "jemaatPihakSatuId",
  "namaPihakSatu",
  "jemaatPihakDuaId",
  "namaPihakDua",
  "namaSaksiSatu",
  "namaSaksiDua",
  "dokumen",
  "keterangan",
] as const;

type FormFieldName = (typeof formFieldNames)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFieldNames.includes(value as FormFieldName);
}

function mergeSelectedOption(
  options: JemaatPernikahanOption[],
  selected: JemaatPernikahanOption | null,
  excludedId?: string,
) {
  const filtered = options.filter((option) => option.id !== excludedId);

  if (!selected || selected.id === excludedId) {
    return filtered;
  }

  if (filtered.some((option) => option.id === selected.id)) {
    return filtered;
  }

  return [selected, ...filtered];
}

type PernikahanFormProps = {
  defaultValues: PernikahanFormValues;
  pernikahan: PernikahanListItem | null;
  onSubmit: (values: PernikahanFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

export function PernikahanForm({
  defaultValues,
  pernikahan,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: PernikahanFormProps) {
  const form = useForm<PernikahanFormValues>({
    resolver: zodResolver(createPernikahanSchema),
    defaultValues,
  });

  const [searchPihakSatu, setSearchPihakSatu] = useState("");
  const [searchPihakDua, setSearchPihakDua] = useState("");

  const [debouncedPihakSatu] = useDebounce(searchPihakSatu.trim(), 400);
  const [debouncedPihakDua] = useDebounce(searchPihakDua.trim(), 400);

  const [selectedPihakSatu, setSelectedPihakSatu] = useState<JemaatPernikahanOption | null>(
    pernikahan?.jemaatPihakSatu ?? null,
  );

  const [selectedPihakDua, setSelectedPihakDua] = useState<JemaatPernikahanOption | null>(
    pernikahan?.jemaatPihakDua ?? null,
  );

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const pihakSatuQuery = useJemaatPernikahanOptionsQuery({
    q: debouncedPihakSatu || undefined,
    currentPernikahanId: pernikahan?.id,
  });

  const pihakDuaQuery = useJemaatPernikahanOptionsQuery({
    q: debouncedPihakDua || undefined,
    currentPernikahanId: pernikahan?.id,
  });

  const pihakSatuOptions = useMemo(
    () =>
      mergeSelectedOption(pihakSatuQuery.data?.data ?? [], selectedPihakSatu, selectedPihakDua?.id),
    [pihakSatuQuery.data?.data, selectedPihakSatu, selectedPihakDua?.id],
  );

  const pihakDuaOptions = useMemo(
    () =>
      mergeSelectedOption(pihakDuaQuery.data?.data ?? [], selectedPihakDua, selectedPihakSatu?.id),
    [pihakDuaQuery.data?.data, selectedPihakDua, selectedPihakSatu?.id],
  );

  async function handleSubmit(values: PernikahanFormValues) {
    form.clearErrors("root.server");

    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        throw error;
      }

      let hasMappedError = false;

      for (const [fieldName, messages] of Object.entries(error.fieldErrors ?? {})) {
        if (!isFormFieldName(fieldName)) {
          continue;
        }

        form.setError(fieldName, {
          type: "server",
          message: messages[0] ?? "Data tidak valid.",
        });

        hasMappedError = true;
      }

      if (!hasMappedError) {
        form.setError("root.server", {
          type: "server",
          message: error.message || "Data Pernikahan tidak dapat disimpan.",
        });
      }
    }
  }

  function handlePihakSatuChange(value: string) {
    if (value === EXTERNAL_PARTY_VALUE) {
      const previouslyJemaat = Boolean(form.getValues("jemaatPihakSatuId"));

      setSelectedPihakSatu(null);

      form.setValue("jemaatPihakSatuId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (previouslyJemaat) {
        form.setValue("namaPihakSatu", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    const option = pihakSatuOptions.find((item) => item.id === value);

    if (!option) {
      return;
    }

    setSelectedPihakSatu(option);

    form.setValue("jemaatPihakSatuId", option.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue("namaPihakSatu", option.namaLengkap, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handlePihakDuaChange(value: string) {
    if (value === EXTERNAL_PARTY_VALUE) {
      const previouslyJemaat = Boolean(form.getValues("jemaatPihakDuaId"));

      setSelectedPihakDua(null);

      form.setValue("jemaatPihakDuaId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (previouslyJemaat) {
        form.setValue("namaPihakDua", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      return;
    }

    const option = pihakDuaOptions.find((item) => item.id === value);

    if (!option) {
      return;
    }

    setSelectedPihakDua(option);

    form.setValue("jemaatPihakDuaId", option.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue("namaPihakDua", option.namaLengkap, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const rootError = form.formState.errors.root?.server;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        {rootError?.message ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {rootError.message}
          </div>
        ) : null}

        <Controller
          control={form.control}
          name="unitGerejaId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Unit pencatatan</FieldLabel>

              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isSubmitting || unitOptions.isPending}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Pilih unit gereja" />
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="nomorPencatatan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nomor pencatatan</FieldLabel>
                <Input {...field} id={field.name} disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="nomorSertifikat"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nomor sertifikat</FieldLabel>
                <Input {...field} id={field.name} disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="tanggalPernikahan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tanggal pernikahan</FieldLabel>
                <Input {...field} id={field.name} type="date" disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="tempatPernikahan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tempat pernikahan</FieldLabel>
                <Input {...field} id={field.name} disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="namaPelayan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama pelayan</FieldLabel>
              <Input {...field} id={field.name} disabled={isSubmitting} />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Pihak pertama</h3>
            <p className="text-sm text-muted-foreground">Pilih Jemaat atau isi nama pihak luar.</p>
          </div>

          <Field>
            <FieldLabel htmlFor="search-pihak-satu">Cari jemaat</FieldLabel>
            <Input
              id="search-pihak-satu"
              value={searchPihakSatu}
              onChange={(event) => setSearchPihakSatu(event.target.value)}
              disabled={isSubmitting}
            />
          </Field>

          <Controller
            control={form.control}
            name="jemaatPihakSatuId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Sumber pihak pertama</FieldLabel>

                <Select
                  value={field.value || EXTERNAL_PARTY_VALUE}
                  onValueChange={handlePihakSatuChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value={EXTERNAL_PARTY_VALUE}>Pihak luar / bukan Jemaat</SelectItem>

                    {pihakSatuOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.nomorIndukGereja} — {option.namaLengkap} — {option.unitGereja.kode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {pihakSatuQuery.isFetching ? (
                  <FieldDescription>Mencari data Jemaat...</FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="namaPihakSatu"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nama pihak pertama</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  disabled={isSubmitting || Boolean(selectedPihakSatu)}
                />

                {selectedPihakSatu ? (
                  <FieldDescription>Nama mengikuti data Jemaat yang dipilih.</FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Pihak kedua</h3>
            <p className="text-sm text-muted-foreground">Pilih Jemaat atau isi nama pihak luar.</p>
          </div>

          <Field>
            <FieldLabel htmlFor="search-pihak-dua">Cari jemaat</FieldLabel>
            <Input
              id="search-pihak-dua"
              value={searchPihakDua}
              onChange={(event) => setSearchPihakDua(event.target.value)}
              disabled={isSubmitting}
            />
          </Field>

          <Controller
            control={form.control}
            name="jemaatPihakDuaId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Sumber pihak kedua</FieldLabel>

                <Select
                  value={field.value || EXTERNAL_PARTY_VALUE}
                  onValueChange={handlePihakDuaChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value={EXTERNAL_PARTY_VALUE}>Pihak luar / bukan Jemaat</SelectItem>

                    {pihakDuaOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.nomorIndukGereja} — {option.namaLengkap} — {option.unitGereja.kode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {pihakDuaQuery.isFetching ? (
                  <FieldDescription>Mencari data Jemaat...</FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="namaPihakDua"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nama pihak kedua</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  disabled={isSubmitting || Boolean(selectedPihakDua)}
                />

                {selectedPihakDua ? (
                  <FieldDescription>Nama mengikuti data Jemaat yang dipilih.</FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="namaSaksiSatu"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Saksi pertama</FieldLabel>
                <Input {...field} id={field.name} disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="namaSaksiDua"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Saksi kedua</FieldLabel>
                <Input {...field} id={field.name} disabled={isSubmitting} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="dokumen"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Dokumen</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="URL atau lokasi dokumen"
                disabled={isSubmitting}
              />
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
              <Textarea {...field} id={field.name} rows={4} disabled={isSubmitting} />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || unitOptions.isPending || unitOptions.isError}
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
