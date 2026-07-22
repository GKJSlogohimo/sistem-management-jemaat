import { ShieldX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-6" />
          </div>

          <CardTitle>Akses ditolak</CardTitle>

          <CardDescription>
            Akun Anda tidak memiliki hak akses untuk membuka halaman ini.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/dashboard">Kembali ke dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
