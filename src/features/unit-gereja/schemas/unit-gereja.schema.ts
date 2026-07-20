import { z } from "zod";

export const jenisUnitGerejaSchema = z.enum(["INDUK", "SUB_INDUK"]);

const optionalEmailSchema = z
  .string()
  .trim()
  .max(150, "Email maksimal 150 karakter.")
  .refine((value) => value.length === 0 || z.string().email().safeParse(value).success, {
    message: "Format email tidak valid.",
  });

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Nomor HP maksimal 30 karakter.")
  .refine((value) => value.length === 0 || /^[0-9+\-()\s]+$/.test(value), {
    message: "Format nomor HP tidak valid.",
  });

export const unitGerejaFormSchema = z
  .object({
    kode: z
      .string()
      .trim()
      .min(1, "Kode unit wajib diisi.")
      .max(30, "Kode maksimal 30 karakter.")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Kode hanya boleh berisi huruf kapital, angka, tanda hubung, dan garis bawah.",
      ),

    nama: z
      .string()
      .trim()
      .min(1, "Nama unit wajib diisi.")
      .max(150, "Nama maksimal 150 karakter."),

    jenis: jenisUnitGerejaSchema,

    parentId: z.string().uuid().nullable(),

    alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),

    noHp: optionalPhoneSchema,

    email: optionalEmailSchema,

    penanggungJawab: z.string().trim().max(150, "Nama penanggung jawab maksimal 150 karakter."),

    aktif: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.jenis === "SUB_INDUK" && !values.parentId) {
      context.addIssue({
        code: "custom",
        path: ["parentId"],
        message: "Subinduk wajib mempunyai unit gereja induk.",
      });
    }

    if (values.jenis === "INDUK" && values.parentId) {
      context.addIssue({
        code: "custom",
        path: ["parentId"],
        message: "Unit gereja induk tidak boleh mempunyai parent.",
      });
    }
  });

export const unitGerejaListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  sortBy: z.enum(["kode", "nama", "jenis", "aktif", "createdAt"]).default("nama"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const unitGerejaIdSchema = z.string().uuid();

export type UnitGerejaFormValues = z.infer<typeof unitGerejaFormSchema>;

export type UnitGerejaListQuery = z.infer<typeof unitGerejaListQuerySchema>;

export type JenisUnitGerejaValue = z.infer<typeof jenisUnitGerejaSchema>;
