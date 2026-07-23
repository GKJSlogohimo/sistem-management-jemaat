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

import { statusKematianOptions } from "../constants";
import { useJemaatKematianOptionsQuery } from "../hooks/use-kematian-query";
import { kematianFormSchema, type KematianFormValues } from "../schemas/kematian.schema";
import type { JemaatKematianOption, KematianListItem } from "../types";

const formFieldNames = [
  "jemaatId",
  "tanggalMeninggal",
  "waktuMeninggal",
  "tempatMeninggal",
  "penyebabKematian",
  "nomorSuratKematian",
  "instansiPenerbit",
  "dokumenSuratKematian",
  "alamatRumahDuka",
  "tanggalIbadahPenghiburan",
  "waktuIbadahPenghiburan",
  "lokasiIbadahPenghiburan",
  "namaPelayanPenghiburan",
  "temaPelayanan",
  "catatanPelayanan",
  "tanggalPemakaman",
  "waktuPemakaman",
  "lokasiPemakaman",
  "namaTempatPemakaman",
  "namaPelayanPemakaman",
  "nomorLokasiMakam",
  "keteranganPemakaman",
  "status",
  "keterangan",
] as const;

type FormFieldName = (typeof formFieldNames)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFieldNames.includes(value as FormFieldName);
}

function mergeSelectedOption(
  options: JemaatKematianOption[],
  selected: JemaatKematianOption | null,
) {
  if (!selected) {
    return options;
  }

  if (options.some((option) => option.id === selected.id)) {
    return options;
  }

  return [selected, ...options];
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

type KematianFormProps = {
  defaultValues: KematianFormValues;
  kematian: KematianListItem | null;
  onSubmit: (values: KematianFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

export function KematianForm({
  defaultValues,
  kematian,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: KematianFormProps) {
  const form = useForm<KematianFormValues>({
    resolver: zodResolver(kematianFormSchema),
    defaultValues,
  });

  const [jemaatSearch, setJemaatSearch] = useState("");

  const [debouncedJemaatSearch] = useDebounce(jemaatSearch.trim(), 400);

  const [unitFilterId, setUnitFilterId] = useState(kematian?.unitGerejaId ?? "");

  const [selectedJemaat, setSelectedJemaat] = useState<JemaatKematianOption | null>(
    kematian?.jemaat ?? null,
  );

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const jemaatOptionsQuery = useJemaatKematianOptionsQuery({
    q: debouncedJemaatSearch || undefined,

    unitGerejaId: unitFilterId || undefined,

    currentKematianId: kematian?.id,
  });

  const jemaatOptions = useMemo(
    () => mergeSelectedOption(jemaatOptionsQuery.data?.data ?? [], selectedJemaat),
    [jemaatOptionsQuery.data?.data, selectedJemaat],
  );

  const normalizedSearch = jemaatSearch.trim();

  const isSearchDebouncing = normalizedSearch !== debouncedJemaatSearch;

  const isLoadingJemaat = jemaatOptionsQuery.isPending || isSearchDebouncing;

  const availableStatusOptions = useMemo(() => {
    if (!kematian) {
      return statusKematianOptions.filter((option) => option.value !== "DIBATALKAN");
    }

    if (kematian.status === "TERVERIFIKASI") {
      return statusKematianOptions.filter((option) => option.value === "TERVERIFIKASI");
    }

    if (kematian.status === "DIBATALKAN") {
      return statusKematianOptions.filter((option) => option.value !== "TERVERIFIKASI");
    }

    return statusKematianOptions;
  }, [kematian]);

  async function handleSubmit(values: KematianFormValues) {
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
          message: error.message || "Pencatatan kematian tidak dapat disimpan.",
        });
      }
    }
  }

  function handleUnitFilterChange(value: string) {
    const nextUnitId = value === "all" ? "" : value;

    setUnitFilterId(nextUnitId);
    setJemaatSearch("");

    if (selectedJemaat && nextUnitId && selectedJemaat.unitGerejaId !== nextUnitId) {
      setSelectedJemaat(null);

      form.setValue("jemaatId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleJemaatChange(value: string) {
    const selected = jemaatOptions.find((option) => option.id === value) ?? null;

    setSelectedJemaat(selected);

    form.setValue("jemaatId", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (selected) {
      setUnitFilterId(selected.unitGerejaId);

      setJemaatSearch("");
    }
  }

  const rootError = form.formState.errors.root?.server;

  const selectedStatus = form.watch("status");

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

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Data Jemaat</h3>

            <p className="text-sm text-muted-foreground">
              Pilih Jemaat yang akan dicatat. Unit Gereja mengikuti data Jemaat.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="kematian-unit-filter">Filter Unit Gereja</FieldLabel>

            <Select
              value={unitFilterId || "all"}
              onValueChange={handleUnitFilterChange}
              disabled={isSubmitting || unitOptions.isPending}
            >
              <SelectTrigger id="kematian-unit-filter">
                <SelectValue placeholder="Semua unit gereja" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua unit gereja</SelectItem>

                {unitOptions.data?.data.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.kode} — {unit.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="kematian-jemaat-search">Cari Jemaat</FieldLabel>

            <Input
              id="kematian-jemaat-search"
              value={jemaatSearch}
              onChange={(event) => setJemaatSearch(event.target.value)}
              placeholder="Cari nama atau nomor induk gereja"
              autoComplete="off"
              disabled={isSubmitting}
            />

            <FieldDescription>
              {isSearchDebouncing
                ? "Menunggu pencarian..."
                : "Pencarian dijalankan setelah jeda 400 ms."}
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
                    onValueChange={handleJemaatChange}
                    disabled={
                      isSubmitting || isLoadingJemaat || jemaatOptionsQuery.isError || !hasOptions
                    }
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue
                        placeholder={
                          isLoadingJemaat
                            ? "Mencari Jemaat..."
                            : hasOptions
                              ? "Pilih Jemaat"
                              : "Tidak ada Jemaat tersedia"
                        }
                      />
                    </SelectTrigger>

                    {hasOptions ? (
                      <SelectContent position="popper" sideOffset={4}>
                        {jemaatOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.nomorIndukGereja}
                            {" — "}
                            {option.namaLengkap}
                            {" — "}
                            {option.unitGereja.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    ) : null}
                  </Select>

                  {jemaatOptionsQuery.isError ? (
                    <FieldDescription className="text-destructive">
                      Daftar Jemaat tidak dapat dimuat.
                    </FieldDescription>
                  ) : !isLoadingJemaat && !hasOptions ? (
                    <FieldDescription>Tidak ada Jemaat aktif yang dapat dicatat.</FieldDescription>
                  ) : null}

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              );
            }}
          />

          {selectedJemaat ? (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div className="font-medium">{selectedJemaat.namaLengkap}</div>

              <div className="mt-1 text-muted-foreground">
                {selectedJemaat.nomorIndukGereja}
                {" · "}
                {selectedJemaat.unitGereja.kode}
                {" — "}
                {selectedJemaat.unitGereja.nama}
              </div>

              <div className="mt-1 text-muted-foreground">
                Tanggal lahir: {formatDate(selectedJemaat.tanggalLahir)}
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Informasi Meninggal</h3>

            <p className="text-sm text-muted-foreground">
              Informasi utama mengenai waktu dan tempat meninggal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="tanggalMeninggal"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tanggal meninggal</FieldLabel>

                  <Input {...field} id={field.name} type="date" disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="waktuMeninggal"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Waktu meninggal</FieldLabel>

                  <Input {...field} id={field.name} type="time" disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="tempatMeninggal"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tempat meninggal</FieldLabel>

                <Input {...field} id={field.name} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="penyebabKematian"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Penyebab kematian</FieldLabel>

                <Textarea {...field} id={field.name} rows={3} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Surat Kematian dan Rumah Duka</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="nomorSuratKematian"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nomor surat kematian</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="instansiPenerbit"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Instansi penerbit</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="dokumenSuratKematian"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Dokumen surat kematian</FieldLabel>

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
            name="alamatRumahDuka"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Alamat rumah duka</FieldLabel>

                <Textarea {...field} id={field.name} rows={3} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Ibadah Penghiburan</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="tanggalIbadahPenghiburan"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tanggal ibadah</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    // eslint-disable-next-line react-hooks/incompatible-library
                    min={form.watch("tanggalMeninggal") || undefined}
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="waktuIbadahPenghiburan"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Waktu ibadah</FieldLabel>

                  <Input {...field} id={field.name} type="time" disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="lokasiIbadahPenghiburan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Lokasi ibadah</FieldLabel>

                <Input {...field} id={field.name} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="namaPelayanPenghiburan"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nama pelayan</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="temaPelayanan"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tema pelayanan</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="catatanPelayanan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Catatan pelayanan</FieldLabel>

                <Textarea {...field} id={field.name} rows={3} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Pemakaman</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="tanggalPemakaman"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tanggal pemakaman</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    min={form.watch("tanggalMeninggal") || undefined}
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="waktuPemakaman"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Waktu pemakaman</FieldLabel>

                  <Input {...field} id={field.name} type="time" disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="namaTempatPemakaman"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nama tempat pemakaman</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="lokasiPemakaman"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Lokasi pemakaman</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="namaPelayanPemakaman"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nama pelayan</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="nomorLokasiMakam"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nomor lokasi makam</FieldLabel>

                  <Input {...field} id={field.name} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="keteranganPemakaman"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Keterangan pemakaman</FieldLabel>

                <Textarea {...field} id={field.name} rows={3} disabled={isSubmitting} />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">Status Pencatatan</h3>
          </div>

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedStatus === "TERVERIFIKASI" ? (
                  <FieldDescription className="text-destructive">
                    Setelah diverifikasi, pencatatan menjadi final dan status Jemaat berubah menjadi
                    tidak aktif karena meninggal.
                  </FieldDescription>
                ) : selectedStatus === "DIBATALKAN" ? (
                  <FieldDescription>
                    Alasan pembatalan wajib ditulis pada keterangan.
                  </FieldDescription>
                ) : (
                  <FieldDescription>Draft masih dapat diperbarui atau dihapus.</FieldDescription>
                )}

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
        </section>

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting ||
            unitOptions.isPending ||
            unitOptions.isError ||
            jemaatOptionsQuery.isError
          }
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
