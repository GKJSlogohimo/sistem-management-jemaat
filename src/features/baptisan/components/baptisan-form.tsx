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

import { jenisBaptisanOptions } from "../constants";
import { useJemaatBaptisanOptionsQuery } from "../hooks/use-baptisan-query";
import { type BaptisanFormValues, createBaptisanSchema } from "../schemas/baptisan.schema";
import type { BaptisanListItem, JemaatBaptisanOption } from "../types";

const formFieldNames = [
  "jemaatId",
  "jenis",
  "tanggalBaptisan",
  "tempatBaptisan",
  "namaPelayan",
  "nomorSertifikat",
  "dokumen",
  "keterangan",
] as const;

type FormFieldName = (typeof formFieldNames)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFieldNames.includes(value as FormFieldName);
}

type BaptisanFormProps = {
  defaultValues: BaptisanFormValues;
  baptisan: BaptisanListItem | null;
  onSubmit: (values: BaptisanFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

export function BaptisanForm({
  defaultValues,
  baptisan,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: BaptisanFormProps) {
  const form = useForm<BaptisanFormValues>({
    resolver: zodResolver(createBaptisanSchema),
    defaultValues,
  });

  const [unitId, setUnitId] = useState(baptisan?.unitGerejaId ?? "");
  const [jemaatSearch, setJemaatSearch] = useState("");

  const normalizedJemaatSearch = jemaatSearch.trim();

  const [debouncedJemaatSearch] = useDebounce(normalizedJemaatSearch, 400);

  const isSearchDebouncing = normalizedJemaatSearch !== debouncedJemaatSearch;

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedJenis = form.watch("jenis");

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const jemaatOptionsQuery = useJemaatBaptisanOptionsQuery({
    q: debouncedJemaatSearch || undefined,
    unitGerejaId: unitId || undefined,
    jenis: selectedJenis,
    currentBaptisanId: baptisan?.id,
  });

  const [selectedJemaatOption, setSelectedJemaatOption] = useState<JemaatBaptisanOption | null>(
    () => {
      if (!baptisan) {
        return null;
      }

      return {
        id: baptisan.jemaat.id,
        unitGerejaId: baptisan.unitGerejaId,
        nomorIndukGereja: baptisan.jemaat.nomorIndukGereja,
        namaLengkap: baptisan.jemaat.namaLengkap,
        unitGereja: baptisan.unitGereja,
      };
    },
  );

  const jemaatOptions = useMemo(() => {
    const options = jemaatOptionsQuery.data?.data ?? [];

    if (!selectedJemaatOption) {
      return options;
    }

    const selectedAlreadyExists = options.some((option) => option.id === selectedJemaatOption.id);

    if (selectedAlreadyExists) {
      return options;
    }

    /*
     * Opsi terpilih tetap tersedia meskipun tidak cocok
     * dengan pencarian yang sedang diketik.
     */
    return [selectedJemaatOption, ...options];
  }, [jemaatOptionsQuery.data?.data, selectedJemaatOption]);

  async function handleSubmit(values: BaptisanFormValues) {
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
          message: error.message || "Data Baptisan tidak dapat disimpan.",
        });
      }
    }
  }

  function handleUnitChange(value: string) {
    const nextUnitId = value === "all" ? "" : value;

    if (nextUnitId !== unitId) {
      form.setValue("jemaatId", "", {
        shouldDirty: true,
        shouldValidate: false,
      });

      setSelectedJemaatOption(null);
      setJemaatSearch("");
    }

    setUnitId(nextUnitId);
  }

  function handleJenisChange(value: BaptisanFormValues["jenis"]) {
    const previousJenis = form.getValues("jenis");

    form.setValue("jenis", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value !== previousJenis) {
      form.setValue("jemaatId", "", {
        shouldDirty: true,
        shouldValidate: false,
      });

      setSelectedJemaatOption(null);
    }
  }

  const rootError = form.formState.errors.root?.server;
  const unitOptionsData = unitOptions.data?.data ?? [];
  const isLoadingJemaat = jemaatOptionsQuery.isPending || isSearchDebouncing;

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

        <Field>
          <FieldLabel>Filter unit gereja</FieldLabel>

          <Select
            value={unitId || "all"}
            onValueChange={handleUnitChange}
            disabled={isSubmitting || unitOptions.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua unit gereja" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Semua unit gereja</SelectItem>

              {unitOptionsData.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.kode} — {unit.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {unitOptions.isError ? (
            <FieldDescription className="text-destructive">
              Daftar unit gereja tidak dapat dimuat.
            </FieldDescription>
          ) : (
            <FieldDescription>
              Filter ini hanya membantu mempersempit pilihan jemaat. Unit Baptisan mengikuti unit
              jemaat yang dipilih.
            </FieldDescription>
          )}
        </Field>

        <Controller
          control={form.control}
          name="jenis"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Jenis pencatatan</FieldLabel>

              <Select
                value={field.value}
                onValueChange={(value) => {
                  handleJenisChange(value as BaptisanFormValues["jenis"]);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Pilih jenis pencatatan" />
                </SelectTrigger>

                <SelectContent>
                  {jenisBaptisanOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldDescription>
                Satu jemaat hanya dapat memiliki satu pencatatan aktif untuk jenis yang sama.
              </FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="baptisan-jemaat-search">Cari jemaat</FieldLabel>

          <Input
            id="baptisan-jemaat-search"
            value={jemaatSearch}
            onChange={(event) => {
              setJemaatSearch(event.target.value);
            }}
            placeholder="Cari nama atau nomor induk jemaat"
            autoComplete="off"
            disabled={isSubmitting}
          />

          <FieldDescription>
            {isSearchDebouncing
              ? "Menunggu pencarian..."
              : "Hasil pencarian dibatasi berdasarkan unit dan jenis pencatatan."}
          </FieldDescription>
        </Field>

        <Controller
          control={form.control}
          name="jemaatId"
          render={({ field, fieldState }) => {
            const hasOptions = jemaatOptions.length > 0;
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Jemaat</FieldLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const selectedOption =
                      jemaatOptions.find((option) => option.id === value) ?? null;

                    setSelectedJemaatOption(selectedOption);
                    field.onChange(value);
                  }}
                  disabled={
                    isSubmitting ||
                    isLoadingJemaat ||
                    jemaatOptionsQuery.isPending ||
                    jemaatOptionsQuery.isError ||
                    !hasOptions
                  }
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue
                      placeholder={
                        isLoadingJemaat
                          ? "Mencari jemaat..."
                          : hasOptions
                            ? "Pilih jemaat"
                            : "Tidak ada jemaat tersedia"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent position="popper" sideOffset={4}>
                    {jemaatOptions.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        Tidak ada jemaat yang tersedia
                      </SelectItem>
                    ) : (
                      jemaatOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.nomorIndukGereja} — {option.namaLengkap} —{" "}
                          {option.unitGereja.kode}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {jemaatOptionsQuery.isError ? (
                  <FieldDescription className="text-destructive">
                    Daftar jemaat tidak dapat dimuat.
                  </FieldDescription>
                ) : null}

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            );
          }}
        />

        <Controller
          control={form.control}
          name="tanggalBaptisan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Tanggal pelaksanaan</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="date"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="tempatBaptisan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Tempat pelaksanaan</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Masukkan tempat pelaksanaan"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, maksimal 200 karakter.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="namaPelayan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama pelayan</FieldLabel>

              <Input
                {...field}
                id={field.name}
                placeholder="Nama pendeta atau pelayan"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, maksimal 150 karakter.</FieldDescription>

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

              <Input
                {...field}
                id={field.name}
                placeholder="Masukkan nomor sertifikat"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, tetapi harus unik apabila diisi.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dokumen"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Dokumen</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="URL atau lokasi dokumen"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>
                Masukkan URL atau referensi lokasi dokumen. Upload file belum digunakan pada field
                ini.
              </FieldDescription>

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
                placeholder="Masukkan keterangan tambahan"
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
              />

              <FieldDescription>Opsional, maksimal 1.000 karakter.</FieldDescription>

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting ||
            unitOptions.isPending ||
            unitOptions.isError ||
            jemaatOptionsQuery.isPending ||
            jemaatOptionsQuery.isError
          }
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
