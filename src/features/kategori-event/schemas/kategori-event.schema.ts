import { z } from "zod";

export const kategoriEventIconValues = [
  "CalendarDays",
  "Church",
  "HeartPulse",
  "GraduationCap",
  "Users",
  "Baby",
  "HandHeart",
  "BookOpen",
  "Music",
  "PartyPopper",
] as const;

export const kategoriEventIconSchema = z.enum(kategoriEventIconValues);

export const kategoriEventFormSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(100, "Nama kategori maksimal 100 karakter."),

  ikon: kategoriEventIconSchema.nullable(),

  warna: z
    .string()
    .trim()
    .max(7, "Kode warna maksimal 7 karakter.")
    .refine((value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value), {
      message: "Warna harus menggunakan format HEX, contohnya #2563EB.",
    })
    .transform((value) => (value ? value.toUpperCase() : "")),

  deskripsi: z.string().trim().max(500, "Deskripsi maksimal 500 karakter."),

  aktif: z.boolean(),
});

export const kategoriEventListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  aktif: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value === "true";
    }),

  sortBy: z.enum(["nama", "aktif", "createdAt", "updatedAt"]).default("nama"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const kategoriEventIdSchema = z.string().uuid();

export type KategoriEventFormValues = z.infer<typeof kategoriEventFormSchema>;

export type KategoriEventListQuery = z.infer<typeof kategoriEventListQuerySchema>;

export type KategoriEventIconValue = z.infer<typeof kategoriEventIconSchema>;
