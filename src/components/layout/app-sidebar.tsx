"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  Church,
  Cross,
  Droplets,
  HeartHandshake,
  House,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPinned,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PeranPengguna } from "@/generated/prisma/enums";
import {
  type AllowedRoles,
  BAPTISAN_READ_ROLES,
  EVENT_READ_ROLES,
  hasAnyRole,
  JEMAAT_READ_ROLES,
  KATEGORI_EVENT_READ_ROLES,
  KELUARGA_READ_ROLES,
  KEMATIAN_READ_ROLES,
  PENGGUNA_READ_ROLES,
  PERNIKAHAN_READ_ROLES,
  UNIT_GEREJA_READ_ROLES,
  WILAYAH_READ_ROLES,
} from "@/lib/auth/access-roles";
import { authClient } from "@/lib/auth-client";

import { SidebarThemeMenu } from "./sidebar-theme-menu";

type SidebarUser = {
  name: string;
  email: string | null;
  peran: PeranPengguna;
};

type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: AllowedRoles;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "Utama",

    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Data Gereja",

    items: [
      {
        title: "Unit Gereja",
        href: "/unit-gereja",
        icon: Building2,
        roles: UNIT_GEREJA_READ_ROLES,
      },

      {
        title: "Wilayah",
        href: "/wilayah",
        icon: MapPinned,
        roles: WILAYAH_READ_ROLES,
      },
    ],
  },

  {
    title: "Data Jemaat",

    items: [
      {
        title: "Keluarga",
        href: "/keluarga",
        icon: House,
        roles: KELUARGA_READ_ROLES,
      },

      {
        title: "Jemaat",
        href: "/jemaat",
        icon: Users,
        roles: JEMAAT_READ_ROLES,
      },

      {
        title: "Baptisan",
        href: "/baptisan",
        icon: Droplets,
        roles: BAPTISAN_READ_ROLES,
      },

      {
        title: "Pernikahan",
        href: "/pernikahan",
        icon: HeartHandshake,
        roles: PERNIKAHAN_READ_ROLES,
      },

      {
        title: "Kematian",
        href: "/kematian",
        icon: Cross,
        roles: KEMATIAN_READ_ROLES,
      },
    ],
  },

  {
    title: "Event",

    items: [
      {
        title: "Kategori Event",
        href: "/kategori-event",
        icon: Tags,
        roles: KATEGORI_EVENT_READ_ROLES,
      },

      {
        title: "Daftar Event",
        href: "/event",
        icon: CalendarDays,
        roles: EVENT_READ_ROLES,
      },
    ],
  },

  {
    title: "Sistem",

    items: [
      {
        title: "Manajemen Pengguna",
        href: "/pengguna",
        icon: UserCog,
        roles: PENGGUNA_READ_ROLES,
      },
    ],
  },
];

const roleLabels: Record<PeranPengguna, string> = {
  SUPER_ADMIN: "Super Admin",

  ADMIN_INDUK: "Admin Induk",

  ADMIN_SUB_INDUK: "Admin Subinduk",

  SEKRETARIAT: "Sekretariat",

  PANITIA_EVENT: "Panitia Event",

  PETUGAS_REGISTRASI: "Petugas Registrasi",

  PETUGAS_ANTREAN: "Petugas Antrean",

  PELAYAN: "Pelayan",

  VIEWER: "Viewer",
};

function canViewItem(item: NavigationItem, role: PeranPengguna) {
  if (!item.roles) {
    return true;
  }

  return hasAnyRole(role, item.roles);
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "U";
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const router = useRouter();

  const { isMobile, setOpenMobile } = useSidebar();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,

      items: group.items.filter((item) => canViewItem(item, user.peran)),
    }))
    .filter((group) => group.items.length > 0);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message ?? "Gagal keluar dari aplikasi.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal keluar dari aplikasi.");

      setIsSigningOut(false);
    }
  }

  function handleNavigationClick() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Sistem Manajemen Jemaat">
              <Link href="/dashboard" onClick={handleNavigationClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Church className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sistem Jemaat</span>

                  <span className="truncate text-xs text-muted-foreground">
                    Administrasi Gereja
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActiveRoute(pathname, item.href);

                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={handleNavigationClick}
                        >
                          <Icon />

                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                {getInitials(user.name)}
              </div>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  {roleLabels[user.peran]}
                </span>

                {user.email ? (
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                ) : null}
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarThemeMenu />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip="Keluar"
              disabled={isSigningOut}
              onClick={() => {
                void handleSignOut();
              }}
            >
              {isSigningOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}

              <span>{isSigningOut ? "Keluar..." : "Keluar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
