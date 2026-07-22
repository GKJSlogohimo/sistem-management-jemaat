import { z } from "zod";

export const nomorKkSchema = z
  .string()
  .trim()
  .min(1, "Nomor KK wajib diisi.")
  .regex(/^\d{16}$/, "Nomor KK harus terdiri dari tepat 16 digit angka.");

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Nomor HP maksimal 30 karakter.")
  .refine((value) => value.length === 0 || /^[0-9+\-()\s]+$/.test(value), {
    message: "Format nomor HP tidak valid.",
  });

const keluargaBaseSchema = z.object({
  unitGerejaId: z
    .string()
    .trim()
    .min(1, "Unit gereja wajib dipilih.")
    .uuid("Unit gereja tidak valid."),

  namaKepalaKeluarga: z
    .string()
    .trim()
    .min(1, "Nama kepala keluarga wajib diisi.")
    .min(2, "Nama kepala keluarga minimal 2 karakter.")
    .max(150, "Nama kepala keluarga maksimal 150 karakter."),

  alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),

  noHp: optionalPhoneSchema,
});

/**
 * Schema form dapat disesuaikan berdasarkan
 * apakah Nomor KK wajib ditampilkan.
 *
 * Bentuk input dan output tetap sama:
 * semua field selalu string.
 */
export function createKeluargaFormSchema(requireNomorKK: boolean) {
  return keluargaBaseSchema.extend({
    nomorKK: z
      .string()
      .trim()
      .superRefine((value, context) => {
        if (!requireNomorKK && value.length === 0) {
          return;
        }

        if (value.length === 0) {
          context.addIssue({
            code: "custom",
            message: "Nomor KK wajib diisi.",
          });

          return;
        }

        if (!/^\d{16}$/.test(value)) {
          context.addIssue({
            code: "custom",
            message: "Nomor KK harus terdiri dari tepat 16 digit angka.",
          });
        }
      }),
  });
}

/**
 * Schema form create standar.
 */
export const keluargaFormSchema = createKeluargaFormSchema(true);

/**
 * Schema request API create.
 * Nomor KK selalu wajib.
 */
export const createKeluargaSchema = keluargaBaseSchema.extend({
  nomorKK: nomorKkSchema,
});

/**
 * Schema request API update.
 * Nomor KK boleh tidak dikirim ketika
 * actor tidak memiliki izin melihatnya.
 */
export const updateKeluargaSchema = keluargaBaseSchema.extend({
  nomorKK: nomorKkSchema.optional(),
});

export const keluargaListQuerySchema = z.object({
  q: z.string().trim().max(100, "Pencarian maksimal 100 karakter.").default(""),

  page: z.coerce.number().int().min(1, "Halaman minimal 1.").default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  unitGerejaId: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  }, z.string().uuid("Unit gereja tidak valid.").optional()),

  sortBy: z
    .enum(["nomorKK", "namaKepalaKeluarga", "unitGereja", "createdAt", "updatedAt"])
    .default("namaKepalaKeluarga"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const keluargaIdSchema = z.string().trim().uuid("ID keluarga tidak valid.");

export type KeluargaFormValues = z.infer<typeof keluargaFormSchema>;

export type CreateKeluargaInput = z.infer<typeof createKeluargaSchema>;

export type UpdateKeluargaInput = z.infer<typeof updateKeluargaSchema>;

export type KeluargaListQuery = z.infer<typeof keluargaListQuerySchema>;
