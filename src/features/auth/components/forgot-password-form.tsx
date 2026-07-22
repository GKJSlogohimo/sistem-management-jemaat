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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "../schemas/password-reset.schema";

export function ForgotPasswordForm() {
  const [requestSent, setRequestSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),

    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(values: ForgotPasswordFormValues) {
    form.clearErrors("root.server");

    try {
      const redirectTo = `${window.location.origin}/reset-kata-sandi`;

      const { error } = await authClient.requestPasswordReset({
        email: values.email,

        redirectTo,
      });

      if (error) {
        throw new Error(error.message || "Permintaan tidak dapat diproses.");
      }

      /*
       * Jangan memberi tahu apakah email
       * terdaftar atau tidak.
       */
      setRequestSent(true);
    } catch {
      form.setError("root.server", {
        type: "server",

        message: "Permintaan tidak dapat diproses. Periksa koneksi dan coba kembali.",
      });
    }
  }

  if (requestSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Periksa email Anda</CardTitle>

          <CardDescription>
            Apabila email tersebut terdaftar dan akun masih aktif, tautan pengaturan ulang kata
            sandi akan dikirim.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
            Tautan hanya berlaku selama 30 menit. Periksa juga folder spam apabila email tidak
            terlihat.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setRequestSent(false);
            }}
          >
            Kirim ulang
          </Button>

          <Button asChild className="w-full">
            <Link href="/login">Kembali ke login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const rootError = form.formState.errors.root?.server;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Lupa kata sandi</CardTitle>

        <CardDescription>
          Masukkan email akun Anda. Sistem akan mengirim tautan untuk membuat kata sandi baru.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="forgot-password-form" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
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

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="forgot-password-form"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Mengirim..." : "Kirim tautan reset"}
        </Button>

        <Button asChild variant="ghost" className="w-full">
          <Link href="/login">Kembali ke login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
