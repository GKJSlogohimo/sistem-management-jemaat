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
import { useActiveUnitGerejaOptionsQuery } from "@/features/unit-gereja/hooks/use-unit-gereja-query";
import { ApiClientError } from "@/lib/api/api-client";

import { peranPenggunaOptions, roleRequiresUnit } from "../constants";
import { useJemaatPenggunaOptionsQuery } from "../hooks/use-pengguna-query";
import {
  type CreatePenggunaInput,
  createPenggunaSchema,
  type UpdatePenggunaInput,
  updatePenggunaSchema,
} from "../schemas/pengguna.schema";

type PenggunaFormProps =
  | {
      mode: "create";
      userId?: never;
      email?: never;
      defaultValues: CreatePenggunaInput;
      onSubmit: (values: CreatePenggunaInput) => Promise<void>;
      isSubmitting: boolean;
    }
  | {
      mode: "edit";
      userId: string;
      email: string;
      defaultValues: UpdatePenggunaInput;
      onSubmit: (values: UpdatePenggunaInput) => Promise<void>;
      isSubmitting: boolean;
    };

export function PenggunaForm(props: PenggunaFormProps) {
  const isCreate = props.mode === "create";

  const form = useForm<CreatePenggunaInput | UpdatePenggunaInput>({
    resolver: zodResolver(isCreate ? createPenggunaSchema : updatePenggunaSchema),
    defaultValues: props.defaultValues,
  });

  const peran = useWatch({
    control: form.control,
    name: "peran",
  });

  const unitGerejaId = useWatch({
    control: form.control,
    name: "unitGerejaId",
  });

  const unitOptions = useActiveUnitGerejaOptionsQuery();

  const jemaatOptions = useJemaatPenggunaOptionsQuery(
    unitGerejaId ?? undefined,
    props.mode === "edit" ? props.userId : undefined,
  );

  async function handleSubmit(values: CreatePenggunaInput | UpdatePenggunaInput) {
    try {
      if (props.mode === "create") {
        await props.onSubmit(values as CreatePenggunaInput);
      } else {
        await props.onSubmit(values as UpdatePenggunaInput);
      }
    } catch (error) {
      if (!(error instanceof ApiClientError) || !error.fieldErrors) {
        throw error;
      }

      for (const [name, messages] of Object.entries(error.fieldErrors)) {
        form.setError(name as keyof typeof values, {
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
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama pengguna</FieldLabel>

              <Input
                {...field}
                id={field.name}
                disabled={props.isSubmitting}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        {isCreate ? (
          <>
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
                    autoComplete="off"
                    disabled={props.isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Kata sandi awal</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      disabled={props.isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Konfirmasi kata sandi</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      disabled={props.isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>
          </>
        ) : (
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={props.email} disabled />
            <FieldDescription>Email belum dapat diubah melalui halaman ini.</FieldDescription>
          </Field>
        )}

        <Controller
          control={form.control}
          name="peran"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>

              <Select
                value={field.value}
                disabled={props.isSubmitting}
                onValueChange={(value) => {
                  field.onChange(value);

                  if (value === "SUPER_ADMIN") {
                    form.setValue("unitGerejaId", null);
                    form.setValue("jemaatId", null);
                  }
                }}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {peranPenggunaOptions.map((option) => (
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

        {roleRequiresUnit(peran) ? (
          <Controller
            control={form.control}
            name="unitGerejaId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Unit Gereja</FieldLabel>

                <Select
                  value={field.value ?? undefined}
                  disabled={props.isSubmitting || unitOptions.isPending}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("jemaatId", null);
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
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
        ) : null}

        {roleRequiresUnit(peran) ? (
          <Controller
            control={form.control}
            name="jemaatId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Hubungkan ke Jemaat</FieldLabel>

                <Select
                  value={field.value ?? "none"}
                  disabled={props.isSubmitting || !unitGerejaId || jemaatOptions.isPending}
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Opsional" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">Tidak dihubungkan</SelectItem>

                    {jemaatOptions.data?.data.map((jemaat) => (
                      <SelectItem key={jemaat.id} value={jemaat.id}>
                        {jemaat.nomorIndukGereja} — {jemaat.namaLengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Satu data jemaat hanya dapat dihubungkan ke satu akun.
                </FieldDescription>

                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        ) : null}

        <Controller
          control={form.control}
          name="aktif"
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel htmlFor={field.name}>Akun aktif</FieldLabel>
                <FieldDescription>
                  Pengguna nonaktif tidak dapat mengakses aplikasi.
                </FieldDescription>
              </div>

              <Switch
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={props.isSubmitting}
              />
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={props.isSubmitting}>
          {props.isSubmitting ? "Menyimpan..." : isCreate ? "Buat akun" : "Simpan perubahan"}
        </Button>
      </FieldGroup>
    </form>
  );
}
