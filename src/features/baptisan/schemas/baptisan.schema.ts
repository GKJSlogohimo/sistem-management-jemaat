import { z } from "zod";

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const requiredDateSchema = z
  .string()
  .trim()
  .min(1, "Tanggal baptisan wajib diisi.")
  .refine(isValidDateInput, {
    message: "Tanggal baptisan tidak valid.",
  });

const optionalDateQuerySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  },
  z
    .string()
    .refine(isValidDateInput, {
      message: "Format tanggal tidak valid.",
    })
    .optional(),
);

const optionalUuidQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}, z.string().uuid("ID tidak valid.").optional());

export const jenisBaptisanSchema = z.enum(["BAPTIS_ANAK", "BAPTIS_DEWASA", "SIDI"]);

const baptisanFormBaseSchema = z.object({
  jemaatId: z.string().trim().min(1, "Jemaat wajib dipilih.").uuid("Jemaat tidak valid."),

  jenis: jenisBaptisanSchema,

  tanggalBaptisan: requiredDateSchema,

  tempatBaptisan: z.string().trim().max(200, "Tempat baptisan maksimal 200 karakter."),

  namaPelayan: z.string().trim().max(150, "Nama pelayan maksimal 150 karakter."),

  nomorSertifikat: z.string().trim().max(100, "Nomor sertifikat maksimal 100 karakter."),

  dokumen: z.string().trim().max(500, "Lokasi dokumen maksimal 500 karakter."),

  keterangan: z.string().trim().max(1000, "Keterangan maksimal 1.000 karakter."),
});

export const createBaptisanSchema = baptisanFormBaseSchema;

export const updateBaptisanSchema = baptisanFormBaseSchema;

export const baptisanListQuerySchema = z
  .object({
    q: z.string().trim().max(100).default(""),

    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce
      .number()
      .int()
      .refine((value) => [10, 20, 30, 50].includes(value), {
        message: "Jumlah data per halaman tidak valid.",
      })
      .default(10),

    unitGerejaId: optionalUuidQuerySchema,

    jenis: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      return value;
    }, jenisBaptisanSchema.optional()),

    tanggalDari: optionalDateQuerySchema,

    tanggalSampai: optionalDateQuerySchema,

    sortBy: z
      .enum([
        "namaJemaat",
        "jenis",
        "tanggalBaptisan",
        "nomorSertifikat",
        "unitGereja",
        "createdAt",
        "updatedAt",
      ])
      .default("tanggalBaptisan"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (values) => {
      if (!values.tanggalDari || !values.tanggalSampai) {
        return true;
      }

      return values.tanggalDari <= values.tanggalSampai;
    },
    {
      path: ["tanggalSampai"],
      message: "Tanggal akhir tidak boleh sebelum tanggal awal.",
    },
  );

export const baptisanIdParamsSchema = z.object({
  id: z.string().uuid("ID Baptisan tidak valid."),
});

export const jemaatBaptisanOptionsQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  unitGerejaId: optionalUuidQuerySchema,

  jenis: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  }, jenisBaptisanSchema.optional()),

  currentBaptisanId: optionalUuidQuerySchema,
});

export type BaptisanFormValues = z.infer<typeof baptisanFormBaseSchema>;

export type CreateBaptisanInput = z.infer<typeof createBaptisanSchema>;

export type UpdateBaptisanInput = z.infer<typeof updateBaptisanSchema>;

export type BaptisanListParams = z.infer<typeof baptisanListQuerySchema>;

export type JemaatBaptisanOptionsParams = z.infer<typeof jemaatBaptisanOptionsQuerySchema>;
