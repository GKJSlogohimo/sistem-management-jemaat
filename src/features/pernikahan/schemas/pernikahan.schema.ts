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

const optionalUuidFormSchema = z.union([z.literal(""), z.string().uuid("Jemaat tidak valid.")]);

const optionalUuidQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}, z.string().uuid("ID tidak valid.").optional());

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
      message: "Tanggal tidak valid.",
    })
    .optional(),
);

const pernikahanBaseSchema = z
  .object({
    unitGerejaId: z
      .string()
      .trim()
      .min(1, "Unit gereja wajib dipilih.")
      .uuid("Unit gereja tidak valid."),

    nomorPencatatan: z.string().trim().max(100, "Nomor pencatatan maksimal 100 karakter."),

    nomorSertifikat: z.string().trim().max(100, "Nomor sertifikat maksimal 100 karakter."),

    tanggalPernikahan: z
      .string()
      .trim()
      .min(1, "Tanggal pernikahan wajib diisi.")
      .refine(isValidDateInput, {
        message: "Tanggal pernikahan tidak valid.",
      }),

    tempatPernikahan: z.string().trim().max(200, "Tempat pernikahan maksimal 200 karakter."),

    namaPelayan: z.string().trim().max(150, "Nama pelayan maksimal 150 karakter."),

    jemaatPihakSatuId: optionalUuidFormSchema,

    namaPihakSatu: z
      .string()
      .trim()
      .min(1, "Nama pihak pertama wajib diisi.")
      .max(150, "Nama pihak pertama maksimal 150 karakter."),

    jemaatPihakDuaId: optionalUuidFormSchema,

    namaPihakDua: z
      .string()
      .trim()
      .min(1, "Nama pihak kedua wajib diisi.")
      .max(150, "Nama pihak kedua maksimal 150 karakter."),

    namaSaksiSatu: z.string().trim().max(150, "Nama saksi pertama maksimal 150 karakter."),

    namaSaksiDua: z.string().trim().max(150, "Nama saksi kedua maksimal 150 karakter."),

    dokumen: z.string().trim().max(500, "Lokasi dokumen maksimal 500 karakter."),

    keterangan: z.string().trim().max(1000, "Keterangan maksimal 1.000 karakter."),
  })
  .superRefine((values, context) => {
    if (!values.jemaatPihakSatuId && !values.jemaatPihakDuaId) {
      context.addIssue({
        code: "custom",
        path: ["jemaatPihakSatuId"],
        message: "Minimal salah satu pihak harus merupakan Jemaat.",
      });

      context.addIssue({
        code: "custom",
        path: ["jemaatPihakDuaId"],
        message: "Minimal salah satu pihak harus merupakan Jemaat.",
      });
    }

    if (
      values.jemaatPihakSatuId &&
      values.jemaatPihakDuaId &&
      values.jemaatPihakSatuId === values.jemaatPihakDuaId
    ) {
      context.addIssue({
        code: "custom",
        path: ["jemaatPihakDuaId"],
        message: "Pihak pertama dan pihak kedua tidak boleh merupakan Jemaat yang sama.",
      });
    }
  });

export const createPernikahanSchema = pernikahanBaseSchema;

export const updatePernikahanSchema = pernikahanBaseSchema;

export const pernikahanListQuerySchema = z
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

    tanggalDari: optionalDateQuerySchema,

    tanggalSampai: optionalDateQuerySchema,

    sortBy: z
      .enum([
        "namaPihakSatu",
        "namaPihakDua",
        "tanggalPernikahan",
        "nomorPencatatan",
        "nomorSertifikat",
        "unitGereja",
        "createdAt",
        "updatedAt",
      ])
      .default("tanggalPernikahan"),

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

export const pernikahanIdParamsSchema = z.object({
  id: z.string().uuid("ID Pernikahan tidak valid."),
});

export const jemaatPernikahanOptionsQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  unitGerejaId: optionalUuidQuerySchema,

  currentPernikahanId: optionalUuidQuerySchema,
});

export type PernikahanFormValues = z.infer<typeof pernikahanBaseSchema>;

export type CreatePernikahanInput = z.infer<typeof createPernikahanSchema>;

export type UpdatePernikahanInput = z.infer<typeof updatePernikahanSchema>;

export type PernikahanListQuery = z.infer<typeof pernikahanListQuerySchema>;

export type JemaatPernikahanOptionsQuery = z.infer<typeof jemaatPernikahanOptionsQuerySchema>;
