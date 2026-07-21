import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type DisplayLayoutProps = {
  children: React.ReactNode;
};

export default async function DisplayLayout({ children }: DisplayLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div className="min-h-dvh">{children}</div>;
}
