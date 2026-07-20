import "server-only";

import { PeranPengguna } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { AppError } from "../api/app-error";

export async function requireActiveProfile(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    throw new AppError("Anda belum masuk.", {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }

  const profile = await prisma.profilPengguna.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      peran: true,
      aktif: true,
      unitGerejaId: true,
    },
  });

  if (!profile) {
    throw new AppError("Profil pengguna belum dikonfigurasi.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  if (!profile.aktif) {
    throw new AppError("Akun pengguna tidak aktif.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  return {
    session,
    profile,
  };
}

export async function requireRoles(requestHeaders: Headers, allowedRoles: PeranPengguna[]) {
  const result = await requireActiveProfile(requestHeaders);

  if (!allowedRoles.includes(result.profile.peran)) {
    throw new AppError("Anda tidak memiliki akses untuk melakukan tindakan ini.", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  return result;
}
