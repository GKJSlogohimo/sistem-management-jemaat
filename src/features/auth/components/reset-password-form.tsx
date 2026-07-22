"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "../schemas/password-reset.schema";

type ResetPasswordFormProps = {
  token: string | null;
  invalidToken: boolean;
};

export function ResetPasswordForm({ token, invalidToken }: ResetPasswordFormProps) {
  const [passwordChanged, setPasswordChanged] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      form.setError("root.server", {
        type: "server",
        message: "Tautan pengaturan ulang tidak valid.",
      });

      return;
    }

    form.clearErrors("root.server");

    try {
      const { error } = await authClient.resetPassword({
        token,

        newPassword: values.newPassword,
      });

      if (error) {
        throw new Error(error.message || "Kata sandi tidak dapat diubah.");
      }

      form.reset();

      setPasswordChanged(true);
    } catch {
      form.setError("root.server", {
        type: "server",

        message: "Tautan tidak valid, sudah digunakan, atau telah kedaluwarsa.",
      });
    }
  }

  if (invalidToken || !token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tautan tidak valid</CardTitle>

          <CardDescription>
            Tautan pengaturan ulang kata sandi tidak valid atau telah kedaluwarsa.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/lupa-kata-sandi">Minta tautan baru</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Kembali ke login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (passwordChanged) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kata sandi diperbarui</CardTitle>

          <CardDescription>
            Kata sandi baru berhasil disimpan. Silakan masuk kembali menggunakan kata sandi
            tersebut.
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Masuk ke aplikasi</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const rootError = form.formState.errors.root?.server;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Buat kata sandi baru</CardTitle>

        <CardDescription>Masukkan kata sandi baru untuk akun Anda.</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="reset-password-form" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
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
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Kata sandi baru</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />

                  <FieldDescription>Minimal 8 dan maksimal 128 karakter.</FieldDescription>

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
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          form="reset-password-form"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan kata sandi baru"}
        </Button>
      </CardFooter>
    </Card>
  );
}
