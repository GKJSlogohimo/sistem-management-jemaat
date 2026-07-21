import type { Metadata } from "next";
// import { RegisterForm } from "@/features/auth/components/register-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daftar | Sistem Manajemen Jemaat",
  description: "Buat akun Sistem Manajemen Jemaat.",
};

// export default function RegisterPage() {
//   return <RegisterForm />;
// }

export default function RegisterPage() {
  redirect("/login");
}
