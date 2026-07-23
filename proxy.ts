import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  /*
   * Pemeriksaan ini hanya untuk redirect cepat.
   * Validasi sesi sebenarnya tetap dilakukan
   * pada page, layout, dan API.
   */
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);

    const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/unit-gereja/:path*",
    "/wilayah/:path*",
    "/keluarga/:path*",
    "/jemaat/:path*",
    "/pengguna/:path*",
    "/kategori-event/:path*",
    "/event/:path*",
    "/baptisan/:path*",
    "/pernikahan/:path*",
  ],
};
