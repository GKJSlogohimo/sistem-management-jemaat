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
import { Textarea } from "@/components/ui/textarea";
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";
import { ApiClientError } from "@/lib/api/api-client";

import { alasanTidakAktifOptions, jenisKelaminOptions, statusJemaatOptions } from "../constants";
import { useKeluargaOptionsQuery, useWilayahOptionsQuery } from "../hooks/use-jemaat-query";
import { jemaatFormSchema, type JemaatFormValues } from "../schemas/jemaat.schema";

type JemaatFormProps = {
  defaultValues: JemaatFormValues;
  onSubmit: (values: JemaatFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
};

const formFields = [
  "nomorIndukGereja",
  "nik",
  "namaLengkap",
  "namaPanggilan",
  "jenisKelamin",
  "tempatLahir",
  "tanggalLahir",
  "alamat",
  "noHp",
  "email",
  "foto",
  "status",
  "tanggalTidakAktif",
  "alasanTidakAktif",
  "keteranganTidakAktif",
  "unitGerejaId",
  "wilayahId",
  "keluargaId",
] as const;

type FormFieldName = (typeof formFields)[number];

function isFormFieldName(value: string): value is FormFieldName {
  return formFields.includes(value as FormFieldName);
}

export function JemaatForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: JemaatFormProps) {
  const form = useForm<JemaatFormValues>({
    resolver: zodResolver(jemaatFormSchema),
    defaultValues,
  });

  const unitGerejaId = useWatch({
    control: form.control,
    name: "unitGerejaId",
  });

  const status = useWatch({
    control: form.control,
    name: "status",
  });

  const unitOptionsQuery = useActiveUnitGerejaOptionsQuery();

  const wilayahOptionsQuery = useWilayahOptionsQuery(unitGerejaId);

  const keluargaOptionsQuery = useKeluargaOptionsQuery(unitGerejaId);

  async function handleSubmit(values: JemaatFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        throw error;
      }

      if (!error.fieldErrors) {
        throw error;
      }

      for (const [name, messages] of Object.entries(error.fieldErrors)) {
        if (!isFormFieldName(name)) {
          continue;
        }

        form.setError(name, {
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
            name="nomorIndukGereja"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nomor induk gereja</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Contoh: JMT-0001"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="nik"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>NIK</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="16 digit NIK"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  onChange={(event) =>
                    field.onChange(event.target.value.replace(/\D/g, "").slice(0, 16))
                  }
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="namaLengkap"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nama lengkap</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Nama lengkap"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="namaPanggilan"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nama panggilan</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Nama panggilan"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Controller
            control={form.control}
            name="jenisKelamin"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Jenis kelamin</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>

                  <SelectContent>
                    {jenisKelaminOptions.map((option) => (
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
            name="tempatLahir"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tempat lahir</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="tanggalLahir"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tanggal lahir</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="unitGerejaId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Unit gereja</FieldLabel>

              <Select
                value={field.value || undefined}
                disabled={isSubmitting || unitOptionsQuery.isPending}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("wilayahId", "");
                  form.setValue("keluargaId", "");
                }}
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

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            control={form.control}
            name="wilayahId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Wilayah</FieldLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || !unitGerejaId || wilayahOptionsQuery.isPending}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih wilayah" />
                  </SelectTrigger>

                  <SelectContent>
                    {wilayahOptionsQuery.data?.data.map((wilayah) => (
                      <SelectItem key={wilayah.id} value={wilayah.id}>
                        {wilayah.nama}
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
            name="keluargaId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Keluarga</FieldLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || !unitGerejaId || keluargaOptionsQuery.isPending}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih keluarga" />
                  </SelectTrigger>

                  <SelectContent>
                    {keluargaOptionsQuery.data?.data.map((keluarga) => (
                      <SelectItem key={keluarga.id} value={keluarga.id}>
                        {keluarga.nomorKK} — {keluarga.namaKepalaKeluarga}
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
          name="alamat"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Alamat</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                rows={3}
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <div className="grid gap-5 md:grid-cols-3">
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
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
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
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="foto"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>URL foto</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Status jemaat</FieldLabel>

              <Select
                value={field.value}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  field.onChange(value);

                  if (value === "AKTIF") {
                    form.setValue("tanggalTidakAktif", "");
                    form.setValue("alasanTidakAktif", null);
                    form.setValue("keteranganTidakAktif", "");
                  }
                }}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {statusJemaatOptions.map((option) => (
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

        {status === "TIDAK_AKTIF" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="tanggalTidakAktif"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tanggal tidak aktif</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="alasanTidakAktif"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Alasan tidak aktif</FieldLabel>

                  <Select
                    value={field.value ?? undefined}
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Pilih alasan" />
                    </SelectTrigger>

                    <SelectContent>
                      {alasanTidakAktifOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Jemaat meninggal dicatat melalui modul Kematian.
                  </FieldDescription>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>
        ) : null}

        {status === "TIDAK_AKTIF" ? (
          <Controller
            control={form.control}
            name="keteranganTidakAktif"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Keterangan tidak aktif</FieldLabel>

                <Textarea
                  {...field}
                  id={field.name}
                  rows={3}
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || unitOptionsQuery.isPending}
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
