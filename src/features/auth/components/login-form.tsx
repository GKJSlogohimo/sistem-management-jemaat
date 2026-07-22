"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

import { getAuthErrorMessage } from "../lib/get-auth-error-message";
import { type LoginInput, loginSchema } from "../schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginInput) {
    setServerError(null);

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
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
        <CardTitle className="text-2xl">Masuk</CardTitle>

        <CardDescription>
          Masukkan email dan kata sandi untuk mengakses Sistem Manajemen Jemaat.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Login gagal</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
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

                  <FieldDescription>Gunakan email yang sudah terdaftar.</FieldDescription>

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-4">
                    <FieldLabel htmlFor={field.name}>Kata sandi</FieldLabel>

                    <Link
                      href="/lupa-password"
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>

                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="rememberMe"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Ingat saya</FieldLabel>

                    <FieldDescription>Pertahankan sesi login pada perangkat ini.</FieldDescription>

                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sedang masuk..." : "Masuk"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      {/* <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Belum memiliki akun?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </CardFooter> */}
    </Card>
  );
}
