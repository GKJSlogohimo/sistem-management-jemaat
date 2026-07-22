import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];

    error?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  const token = getSingleValue(params.token);

  const error = getSingleValue(params.error);

  return <ResetPasswordForm token={token} invalidToken={Boolean(error) || !token} />;
}
