import { z } from "zod";

const nomorKkSchema = z
  .string()
  .trim()
  .min(1, "Nomor KK wajib diisi.")
  .regex(/^[0-9]{16}$/, "Nomor KK harus terdiri dari tepat 16 digit angka.");

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Nomor HP maksimal 30 karakter.")
  .refine((value) => value.length === 0 || /^[0-9+\-()\s]+$/.test(value), {
    message: "Format nomor HP tidak valid.",
  });

export const keluargaFormSchema = z.object({
  unitGerejaId: z.string().min(1, "Unit gereja wajib dipilih.").uuid("Unit gereja tidak valid."),

  nomorKK: nomorKkSchema,

  namaKepalaKeluarga: z
    .string()
    .trim()
    .min(1, "Nama kepala keluarga wajib diisi.")
    .min(2, "Nama kepala keluarga minimal 2 karakter.")
    .max(150, "Nama kepala keluarga maksimal 150 karakter."),

  alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),

  noHp: optionalPhoneSchema,
});

export const keluargaListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  unitGerejaId: z.string().uuid().optional(),

  sortBy: z
    .enum(["nomorKK", "namaKepalaKeluarga", "unitGereja", "createdAt", "updatedAt"])
    .default("namaKepalaKeluarga"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const keluargaIdSchema = z.string().uuid();

export type KeluargaFormValues = z.infer<typeof keluargaFormSchema>;

export type KeluargaListQuery = z.infer<typeof keluargaListQuerySchema>;
