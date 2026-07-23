"use client";

import {
  ArrowRight,
  Church,
  Cross,
  Droplets,
  HeartHandshake,
  House,
  MapPinned,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardSummaryQuery } from "../hooks/use-dashboard-query";
import type { DashboardActivityType, DashboardRecentActivity } from "../types";

const numberFormatter = new Intl.NumberFormat("id-ID");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getActivityLabel(type: DashboardActivityType) {
  switch (type) {
    case "BAPTISAN":
      return "Baptisan";

    case "PERNIKAHAN":
      return "Pernikahan";

    case "KEMATIAN":
      return "Kematian";
  }
}

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  href?: string;
};

function MetricCard({ title, value, description, icon, href }: MetricCardProps) {
  const content = (
    <Card className="h-full transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>

          <CardTitle className="text-3xl">{formatNumber(value)}</CardTitle>
        </div>

        <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>
      </CardHeader>

      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

type ActivityIconProps = {
  type: DashboardActivityType;
};

function ActivityIcon({ type }: ActivityIconProps) {
  const className = "size-4 text-muted-foreground";

  switch (type) {
    case "BAPTISAN":
      return <Droplets className={className} />;

    case "PERNIKAHAN":
      return <HeartHandshake className={className} />;

    case "KEMATIAN":
      return <Cross className={className} />;
  }
}

function RecentActivity({ activity }: { activity: DashboardRecentActivity }) {
  return (
    <Link
      href={activity.href}
      className="flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted"
    >
      <div className="mt-0.5 rounded-md bg-muted p-2">
        <ActivityIcon type={activity.type} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{activity.title}</p>

          <Badge variant="outline" className="text-[10px]">
            {getActivityLabel(activity.type)}
          </Badge>
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">{activity.description}</p>

        <p className="mt-1 text-xs text-muted-foreground">{formatDate(activity.recordDate)}</p>
      </div>

      <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function DashboardSummary() {
  const query = useDashboardSummaryQuery();

  if (query.isPending) {
    return <DashboardSkeleton />;
  }

  if (query.isError || !query.data?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard tidak dapat dimuat</CardTitle>

          <CardDescription>Terjadi kesalahan saat mengambil ringkasan data.</CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void query.refetch();
            }}
          >
            Muat ulang
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalGender = query.data.data.gender.lakiLaki + query.data.data.gender.perempuan;

  const malePercentage =
    totalGender > 0 ? Math.round((query.data.data.gender.lakiLaki / totalGender) * 100) : 0;

  const femalePercentage = totalGender > 0 ? 100 - malePercentage : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total Jemaat"
          value={query.data.data.totals.jemaat}
          description="Seluruh data Jemaat yang tercatat"
          icon={<Users className="size-5" />}
          href="/jemaat"
        />

        <MetricCard
          title="Jemaat Aktif"
          value={query.data.data.totals.jemaatAktif}
          description="Jemaat dengan status keanggotaan aktif"
          icon={<UserCheck className="size-5" />}
          href="/jemaat?status=AKTIF"
        />

        <MetricCard
          title="Jemaat Tidak Aktif"
          value={query.data.data.totals.jemaatTidakAktif}
          description="Jemaat pindah, keluar, meninggal, atau tidak aktif"
          icon={<UserX className="size-5" />}
          href="/jemaat?status=TIDAK_AKTIF"
        />

        <MetricCard
          title="Keluarga"
          value={query.data.data.totals.keluarga}
          description="Jumlah keluarga yang tercatat"
          icon={<House className="size-5" />}
          href="/keluarga"
        />

        <MetricCard
          title="Wilayah"
          value={query.data.data.totals.wilayah}
          description="Wilayah pelayanan aktif"
          icon={<MapPinned className="size-5" />}
          href="/wilayah"
        />

        <MetricCard
          title="Unit Gereja"
          value={query.data.data.totals.unitGereja}
          description="Unit induk dan subinduk aktif"
          icon={<Church className="size-5" />}
          href="/unit-gereja"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={`Baptisan ${query.data.data.currentYear}`}
          value={query.data.data.currentYearRecords.baptisan}
          description="Pencatatan Baptisan dan Sidi tahun berjalan"
          icon={<Droplets className="size-5" />}
          href="/baptisan"
        />

        <MetricCard
          title={`Pernikahan ${query.data.data.currentYear}`}
          value={query.data.data.currentYearRecords.pernikahan}
          description="Pencatatan Pernikahan tahun berjalan"
          icon={<HeartHandshake className="size-5" />}
          href="/pernikahan"
        />

        <MetricCard
          title={`Kematian ${query.data.data.currentYear}`}
          value={query.data.data.currentYearRecords.kematian}
          description="Pencatatan Kematian terverifikasi tahun berjalan"
          icon={<Cross className="size-5" />}
          href="/kematian"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Komposisi Jemaat</CardTitle>

            <CardDescription>Berdasarkan jenis kelamin</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Laki-laki</span>

                <span className="font-medium">
                  {formatNumber(query.data.data.gender.lakiLaki)}
                  {" · "}
                  {malePercentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{
                    width: `${malePercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Perempuan</span>

                <span className="font-medium">
                  {formatNumber(query.data.data.gender.perempuan)}
                  {" · "}
                  {femalePercentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/60"
                  style={{
                    width: `${femalePercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-sm">
              Total data dengan jenis kelamin tercatat: <strong>{formatNumber(totalGender)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Pencatatan Terbaru</CardTitle>

              <CardDescription>Baptisan, Pernikahan, dan Kematian terbaru</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {query.data.data.recentActivities.length > 0 ? (
              <div className="divide-y">
                {query.data.data.recentActivities.map((activity) => (
                  <RecentActivity key={`${activity.type}-${activity.id}`} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Belum ada aktivitas pencatatan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
