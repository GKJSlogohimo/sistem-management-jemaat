import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Masuk | Sistem Manajemen Jemaat",
  description: "Masuk ke Sistem Manajemen Jemaat.",
};

export default function LoginPage() {
  return <LoginForm />;
}
