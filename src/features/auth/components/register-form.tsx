"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

import { getAuthErrorMessage } from "../lib/get-auth-error-message";
import { type RegisterInput, registerSchema } from "../schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: RegisterInput) {
    setServerError(null);

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error.code));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Buat akun</CardTitle>

        <CardDescription>
          Lengkapi data berikut untuk membuat akun Sistem Manajemen Jemaat.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Registrasi gagal</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nama lengkap</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  <FieldDescription>Nama akan ditampilkan pada akun pengguna.</FieldDescription>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  <FieldDescription>Email digunakan untuk masuk ke aplikasi.</FieldDescription>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Kata sandi</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  <FieldDescription>Gunakan minimal 8 karakter.</FieldDescription>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Konfirmasi kata sandi</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Membuat akun..." : "Daftar"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
