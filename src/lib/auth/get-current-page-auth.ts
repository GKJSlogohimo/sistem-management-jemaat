import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";
import type { AppActor } from "@/lib/auth/actor";
import prisma from "@/lib/prisma";

export const getCurrentPageAuth = cache(async () => {
  // const requestId = crypto.randomUUID();
  // const startedAt = performance.now();

  // console.info("[page-auth:start]", {
  //   requestId,
  // });

  // const sessionStartedAt = performance.now();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // const sessionDurationMs = Math.round(performance.now() - sessionStartedAt);

  if (!session) {
    // console.info("[page-auth:end]", {
    //   requestId,
    //   sessionDurationMs,
    //   result: "NO_SESSION",
    // });

    return null;
  }

  // const profileStartedAt = performance.now();

  const userWithProfile = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      profil: {
        select: {
          peran: true,
          unitGerejaId: true,
        },
      },
    },
  });

  // const profileDurationMs = Math.round(performance.now() - profileStartedAt);

  const profile = userWithProfile?.profil;

  if (!profile) {
    // console.info("[page-auth:end]", {
    //   requestId,
    //   sessionDurationMs,
    //   profileDurationMs,
    //   result: "NO_PROFILE",
    // });

    return null;
  }

  const actor = {
    userId: session.user.id,
    peran: profile.peran,
    unitGerejaId: profile.unitGerejaId,
  } satisfies AppActor;

  // console.info("[page-auth:end]", {
  //   requestId,
  //   sessionDurationMs,
  //   profileDurationMs,
  //   totalDurationMs: Math.round(performance.now() - startedAt),
  //   result: "SUCCESS",
  // });

  return {
    session,
    profile,
    actor,
  };
});
