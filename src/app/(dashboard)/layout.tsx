import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireActivePageProfile } from "@/lib/auth/require-page-profile";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const actor = await requireActivePageProfile();

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: actor.session.user.name ?? "Pengguna",

          email: actor.session.user.email ?? null,

          peran: actor.profile.peran,
        }}
      />

      <SidebarInset className="md:ml-3">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />

          <div className="h-4 w-px bg-border" />

          <p className="truncate text-sm font-medium">Sistem Manajemen Jemaat</p>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
