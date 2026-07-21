import { z } from "zod";

export const peranPenggunaSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN_INDUK",
  "ADMIN_SUB_INDUK",
  "SEKRETARIAT",
  "PANITIA_EVENT",
  "PETUGAS_REGISTRASI",
  "PETUGAS_ANTREAN",
  "PELAYAN",
  "VIEWER",
]);

const nullableUuidSchema = z
  .union([z.string().uuid(), z.literal(""), z.null()])
  .transform((value) => (value ? value : null));

const penggunaProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(150, "Nama maksimal 150 karakter."),

    peran: peranPenggunaSchema,

    aktif: z.boolean(),

    unitGerejaId: nullableUuidSchema,
    jemaatId: nullableUuidSchema,
  })
  .superRefine((values, context) => {
    if (values.peran !== "SUPER_ADMIN" && !values.unitGerejaId) {
      context.addIssue({
        code: "custom",
        path: ["unitGerejaId"],
        message: "Unit gereja wajib dipilih untuk role ini.",
      });
    }

    if (values.peran === "SUPER_ADMIN" && values.unitGerejaId) {
      context.addIssue({
        code: "custom",
        path: ["unitGerejaId"],
        message: "Super Admin tidak dibatasi pada satu unit gereja.",
      });
    }

    if (values.peran === "SUPER_ADMIN" && values.jemaatId) {
      context.addIssue({
        code: "custom",
        path: ["jemaatId"],
        message: "Super Admin tidak perlu dihubungkan ke data jemaat.",
      });
    }

    if (values.jemaatId && !values.unitGerejaId) {
      context.addIssue({
        code: "custom",
        path: ["jemaatId"],
        message: "Pilih unit gereja sebelum memilih jemaat.",
      });
    }
  });

export const createPenggunaSchema = penggunaProfileSchema
  .extend({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Format email tidak valid.")
      .max(200, "Email maksimal 200 karakter."),

    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(128, "Kata sandi maksimal 128 karakter."),

    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak sama.",
  });

export const updatePenggunaSchema = penggunaProfileSchema;

export const penggunaListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  peran: peranPenggunaSchema.optional(),

  aktif: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value === "true";
    }),

  unitGerejaId: z.string().uuid().optional(),

  sortBy: z.enum(["name", "email", "peran", "createdAt"]).default("name"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const penggunaIdSchema = z.string().min(1, "ID pengguna tidak valid.");

export const jemaatPenggunaOptionsQuerySchema = z.object({
  unitGerejaId: z.string().uuid(),
  userId: z.string().min(1).optional(),
});

export type PeranPenggunaValue = z.infer<typeof peranPenggunaSchema>;

export type CreatePenggunaInput = z.infer<typeof createPenggunaSchema>;

export type UpdatePenggunaInput = z.infer<typeof updatePenggunaSchema>;

export type PenggunaListQuery = z.infer<typeof penggunaListQuerySchema>;
