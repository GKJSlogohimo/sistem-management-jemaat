import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Daftar | Sistem Manajemen Jemaat",
  description: "Buat akun Sistem Manajemen Jemaat.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
