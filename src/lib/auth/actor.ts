import type { PeranPengguna } from "@/generated/prisma/enums";

export type AppActor = {
  userId: string;
  peran: PeranPengguna;
  unitGerejaId: string | null;
};
