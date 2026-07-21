"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
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
import { ApiClientError } from "@/lib/api/api-client";
import { cn } from "@/lib/utils";

import { jenisPesertaOptions } from "../constants";
import { useJemaatEventOptionsQuery } from "../hooks/use-peserta-event-query";
import {
  pesertaEventFormSchema,
  type PesertaEventFormValues,
} from "../schemas/peserta-event.schema";
import type { PesertaEventListItem } from "../types";

type Props = {
  eventId: string;
  izinkanNonJemaat: boolean;
  peserta: PesertaEventListItem | null;
  defaultValues: PesertaEventFormValues;
  isSubmitting: boolean;
  onSubmit: (values: PesertaEventFormValues) => Promise<void>;
};

const fieldNames = [
  "jenisPeserta",
  "jemaatId",
  "nik",
  "namaLengkap",
  "jenisKelamin",
  "tempatLahir",
  "tanggalLahir",
  "alamat",
  "noHp",
  "email",
  "keterangan",
  "catatan",
] as const;

type FieldName = (typeof fieldNames)[number];

export function PesertaEventForm({
  eventId,
  izinkanNonJemaat,
  peserta,
  defaultValues,
  isSubmitting,
  onSubmit,
}: Props) {
  const form = useForm<PesertaEventFormValues>({
    resolver: zodResolver(pesertaEventFormSchema),
    defaultValues,
  });

  const jenisPeserta = useWatch({
    control: form.control,
    name: "jenisPeserta",
  });

  const selectedJemaatId = useWatch({
    control: form.control,
    name: "jemaatId",
  });

  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search);

  const jemaatQuery = useJemaatEventOptionsQuery(
    eventId,
    deferredSearch,
    jenisPeserta === "JEMAAT" && !peserta,
  );

  useEffect(() => {
    if (jenisPeserta === "JEMAAT") {
      form.setValue("nik", "");
      form.setValue("namaLengkap", "");
      form.setValue("jenisKelamin", null);
      form.setValue("tempatLahir", "");
      form.setValue("tanggalLahir", "");
      form.setValue("alamat", "");
      form.setValue("noHp", "");
      form.setValue("email", "");
      form.setValue("keterangan", "");
    } else {
      form.setValue("jemaatId", "");
    }
  }, [form, jenisPeserta]);

  async function handleSubmit(values: PesertaEventFormValues) {
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
        <Controller
          control={form.control}
          name="jenisPeserta"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Jenis peserta</FieldLabel>

              <Select
                value={field.value}
                disabled={isSubmitting || Boolean(peserta)}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {jenisPesertaOptions
                    .filter((option) => option.value === "JEMAAT" || izinkanNonJemaat)
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

        {jenisPeserta === "JEMAAT" ? (
          peserta ? (
            <Field>
              <FieldLabel>Jemaat</FieldLabel>

              <div className="rounded-md border p-4">
                <p className="font-medium">{peserta.namaPesertaSnapshot}</p>

                <p className="text-sm text-muted-foreground">NIK {peserta.sumber.nik ?? "-"}</p>
              </div>
            </Field>
          ) : (
            <Controller
              control={form.control}
              name="jemaatId"
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Pilih Jemaat</FieldLabel>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                      }}
                      className="pl-9"
                      placeholder="Cari nama, NIK, atau nomor induk..."
                    />
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
                    {jemaatQuery.isPending ? (
                      <p className="p-3 text-sm text-muted-foreground">Memuat data Jemaat...</p>
                    ) : null}

                    {jemaatQuery.data?.data.map((jemaat) => {
                      const selected = selectedJemaatId === jemaat.id;

                      return (
                        <button
                          key={jemaat.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            form.setValue("jemaatId", jemaat.id, {
                              shouldValidate: true,
                            });
                          }}
                          className={cn(
                            "flex w-full items-start justify-between rounded-md border p-3 text-left",
                            selected && "border-primary bg-primary/5",
                          )}
                        >
                          <div>
                            <p className="font-medium">{jemaat.namaLengkap}</p>

                            <p className="text-xs text-muted-foreground">
                              {jemaat.nomorIndukGereja} · NIK {jemaat.nik}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {jemaat.unitGereja.nama} · {jemaat.wilayah.nama}
                            </p>
                          </div>

                          {selected ? <Check className="size-5 text-primary" /> : null}
                        </button>
                      );
                    })}

                    {!jemaatQuery.isPending && jemaatQuery.data?.data.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">Jemaat tidak ditemukan.</p>
                    ) : null}
                  </div>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          )
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="nik"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>NIK</FieldLabel>

                    <Input
                      {...field}
                      inputMode="numeric"
                      maxLength={16}
                      placeholder="Opsional"
                      disabled={isSubmitting}
                      onChange={(event) => {
                        field.onChange(event.target.value.replace(/\D/g, "").slice(0, 16));
                      }}
                    />

                    <FieldDescription>
                      Digunakan untuk mengenali peserta yang pernah mengikuti Event.
                    </FieldDescription>

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="namaLengkap"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nama lengkap</FieldLabel>

                    <Input {...field} disabled={isSubmitting} />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Controller
                control={form.control}
                name="jenisKelamin"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Jenis kelamin</FieldLabel>

                    <Select
                      value={field.value ?? "none"}
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        field.onChange(value === "none" ? null : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">Tidak diisi</SelectItem>

                        <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>

                        <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
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
                    <FieldLabel>Tempat lahir</FieldLabel>

                    <Input {...field} disabled={isSubmitting} />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="tanggalLahir"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tanggal lahir</FieldLabel>

                    <Input {...field} type="date" disabled={isSubmitting} />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="noHp"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nomor HP</FieldLabel>

                    <Input {...field} type="tel" disabled={isSubmitting} />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>

                    <Input {...field} type="email" disabled={isSubmitting} />

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
                  <FieldLabel>Alamat</FieldLabel>

                  <Textarea {...field} rows={3} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="keterangan"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Keterangan peserta</FieldLabel>

                  <Textarea {...field} rows={2} disabled={isSubmitting} />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </>
        )}

        <Controller
          control={form.control}
          name="catatan"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Catatan registrasi</FieldLabel>

              <Textarea {...field} rows={3} disabled={isSubmitting} />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : peserta ? "Simpan perubahan" : "Daftarkan peserta"}
        </Button>
      </FieldGroup>
    </form>
  );
}
