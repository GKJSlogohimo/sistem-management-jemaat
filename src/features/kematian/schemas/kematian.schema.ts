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

function isValidTimeInput(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

const optionalText = (max: number, message: string) => z.string().trim().max(max, message);

const optionalDateFormSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || isValidDateInput(value), "Tanggal tidak valid.");

const optionalTimeFormSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isValidTimeInput(value),
    "Waktu harus menggunakan format HH:mm.",
  );

const optionalUuidQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}, z.string().uuid("ID tidak valid.").optional());

const optionalDateQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}, z.string().refine(isValidDateInput, "Tanggal tidak valid.").optional());

export const kematianFormSchema = z
  .object({
    jemaatId: z.string().trim().min(1, "Jemaat wajib dipilih.").uuid("Jemaat tidak valid."),

    tanggalMeninggal: z
      .string()
      .trim()
      .min(1, "Tanggal meninggal wajib diisi.")
      .refine(isValidDateInput, "Tanggal meninggal tidak valid."),

    waktuMeninggal: optionalTimeFormSchema,

    tempatMeninggal: optionalText(200, "Tempat meninggal maksimal 200 karakter."),

    penyebabKematian: optionalText(1_000, "Penyebab kematian maksimal 1.000 karakter."),

    nomorSuratKematian: optionalText(100, "Nomor surat kematian maksimal 100 karakter."),

    instansiPenerbit: optionalText(150, "Instansi penerbit maksimal 150 karakter."),

    dokumenSuratKematian: optionalText(500, "Lokasi dokumen maksimal 500 karakter."),

    alamatRumahDuka: optionalText(1_000, "Alamat rumah duka maksimal 1.000 karakter."),

    tanggalIbadahPenghiburan: optionalDateFormSchema,
    waktuIbadahPenghiburan: optionalTimeFormSchema,

    lokasiIbadahPenghiburan: optionalText(200, "Lokasi ibadah penghiburan maksimal 200 karakter."),

    namaPelayanPenghiburan: optionalText(150, "Nama pelayan penghiburan maksimal 150 karakter."),

    temaPelayanan: optionalText(200, "Tema pelayanan maksimal 200 karakter."),

    catatanPelayanan: optionalText(1_000, "Catatan pelayanan maksimal 1.000 karakter."),

    tanggalPemakaman: optionalDateFormSchema,
    waktuPemakaman: optionalTimeFormSchema,

    lokasiPemakaman: optionalText(200, "Lokasi pemakaman maksimal 200 karakter."),

    namaTempatPemakaman: optionalText(200, "Nama tempat pemakaman maksimal 200 karakter."),

    namaPelayanPemakaman: optionalText(150, "Nama pelayan pemakaman maksimal 150 karakter."),

    nomorLokasiMakam: optionalText(100, "Nomor lokasi makam maksimal 100 karakter."),

    keteranganPemakaman: optionalText(1_000, "Keterangan pemakaman maksimal 1.000 karakter."),

    status: z.enum(["DRAFT", "TERVERIFIKASI", "DIBATALKAN"]),

    keterangan: optionalText(1_000, "Keterangan maksimal 1.000 karakter."),
  })
  .superRefine((values, context) => {
    if (
      values.tanggalIbadahPenghiburan &&
      values.tanggalIbadahPenghiburan < values.tanggalMeninggal
    ) {
      context.addIssue({
        code: "custom",
        path: ["tanggalIbadahPenghiburan"],
        message: "Tanggal ibadah penghiburan tidak boleh sebelum tanggal meninggal.",
      });
    }

    if (values.tanggalPemakaman && values.tanggalPemakaman < values.tanggalMeninggal) {
      context.addIssue({
        code: "custom",
        path: ["tanggalPemakaman"],
        message: "Tanggal pemakaman tidak boleh sebelum tanggal meninggal.",
      });
    }

    if (values.waktuIbadahPenghiburan && !values.tanggalIbadahPenghiburan) {
      context.addIssue({
        code: "custom",
        path: ["tanggalIbadahPenghiburan"],
        message: "Tanggal ibadah penghiburan wajib diisi apabila waktunya diisi.",
      });
    }

    if (values.waktuPemakaman && !values.tanggalPemakaman) {
      context.addIssue({
        code: "custom",
        path: ["tanggalPemakaman"],
        message: "Tanggal pemakaman wajib diisi apabila waktunya diisi.",
      });
    }

    if (values.status === "DIBATALKAN" && values.keterangan.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["keterangan"],
        message: "Alasan pembatalan wajib ditulis pada keterangan.",
      });
    }
  });

export const createKematianSchema = kematianFormSchema;

export const updateKematianSchema = kematianFormSchema;

export const kematianListQuerySchema = z
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

    status: z.enum(["DRAFT", "TERVERIFIKASI", "DIBATALKAN"]).optional(),

    tanggalDari: optionalDateQuerySchema,
    tanggalSampai: optionalDateQuerySchema,

    sortBy: z
      .enum([
        "namaJemaat",
        "tanggalMeninggal",
        "umurSaatMeninggal",
        "nomorSuratKematian",
        "status",
        "unitGereja",
        "createdAt",
        "updatedAt",
      ])
      .default("tanggalMeninggal"),

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

export const kematianIdParamsSchema = z.object({
  id: z.string().uuid("ID Kematian tidak valid."),
});

export const jemaatKematianOptionsQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  unitGerejaId: optionalUuidQuerySchema,

  currentKematianId: optionalUuidQuerySchema,
});

export type KematianFormValues = z.infer<typeof kematianFormSchema>;

export type CreateKematianInput = z.infer<typeof createKematianSchema>;

export type UpdateKematianInput = z.infer<typeof updateKematianSchema>;

export type KematianListQuery = z.infer<typeof kematianListQuerySchema>;

export type JemaatKematianOptionsQuery = z.infer<typeof jemaatKematianOptionsQuerySchema>;
