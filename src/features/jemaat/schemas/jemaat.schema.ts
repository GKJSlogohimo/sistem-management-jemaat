import { z } from "zod";

export const jenisKelaminSchema = z.enum(["LAKI_LAKI", "PEREMPUAN"]);

export const statusJemaatSchema = z.enum(["AKTIF", "TIDAK_AKTIF"]);

export const alasanTidakAktifSchema = z.enum([
  "MENINGGAL",
  "PINDAH_GEREJA",
  "KELUAR_KEANGGOTAAN",
  "DATA_GANDA",
  "LAINNYA",
]);

function isValidDateInput(value: string) {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const optionalDateSchema = z.string().refine(isValidDateInput, {
  message: "Format tanggal tidak valid.",
});

const optionalEmailSchema = z
  .string()
  .trim()
  .max(150, "Email maksimal 150 karakter.")
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Format email tidak valid.",
  });

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Nomor HP maksimal 30 karakter.")
  .refine((value) => value === "" || /^[0-9+\-()\s]+$/.test(value), {
    message: "Format nomor HP tidak valid.",
  });

export const jemaatFormSchema = z
  .object({
    nomorIndukGereja: z
      .string()
      .trim()
      .min(1, "Nomor induk gereja wajib diisi.")
      .max(50, "Nomor induk gereja maksimal 50 karakter."),

    nik: z
      .string()
      .trim()
      .regex(/^[0-9]{16}$/, "NIK harus terdiri dari tepat 16 digit angka."),

    namaLengkap: z
      .string()
      .trim()
      .min(1, "Nama lengkap wajib diisi.")
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(150, "Nama lengkap maksimal 150 karakter."),

    namaPanggilan: z.string().trim().max(100, "Nama panggilan maksimal 100 karakter."),

    jenisKelamin: jenisKelaminSchema,

    tempatLahir: z.string().trim().max(100, "Tempat lahir maksimal 100 karakter."),

    tanggalLahir: optionalDateSchema,

    alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),

    noHp: optionalPhoneSchema,
    email: optionalEmailSchema,

    foto: z.string().trim().max(500, "URL foto maksimal 500 karakter."),

    status: statusJemaatSchema,

    tanggalTidakAktif: optionalDateSchema,

    alasanTidakAktif: alasanTidakAktifSchema.nullable(),

    keteranganTidakAktif: z
      .string()
      .trim()
      .max(500, "Keterangan tidak aktif maksimal 500 karakter."),

    unitGerejaId: z.string().min(1, "Unit gereja wajib dipilih.").uuid("Unit gereja tidak valid."),

    wilayahId: z.string().min(1, "Wilayah wajib dipilih.").uuid("Wilayah tidak valid."),

    keluargaId: z.string().min(1, "Keluarga wajib dipilih.").uuid("Keluarga tidak valid."),
  })
  .superRefine((values, context) => {
    if (values.tanggalLahir) {
      const birthDate = new Date(`${values.tanggalLahir}T00:00:00.000Z`);

      if (birthDate > new Date()) {
        context.addIssue({
          code: "custom",
          path: ["tanggalLahir"],
          message: "Tanggal lahir tidak boleh melebihi hari ini.",
        });
      }
    }

    if (values.status === "TIDAK_AKTIF") {
      if (!values.tanggalTidakAktif) {
        context.addIssue({
          code: "custom",
          path: ["tanggalTidakAktif"],
          message: "Tanggal tidak aktif wajib diisi.",
        });
      }

      if (!values.alasanTidakAktif) {
        context.addIssue({
          code: "custom",
          path: ["alasanTidakAktif"],
          message: "Alasan tidak aktif wajib dipilih.",
        });
      }
    }

    if (values.alasanTidakAktif === "LAINNYA" && !values.keteranganTidakAktif) {
      context.addIssue({
        code: "custom",
        path: ["keteranganTidakAktif"],
        message: "Keterangan wajib diisi untuk alasan lainnya.",
      });
    }

    if (values.alasanTidakAktif === "MENINGGAL") {
      context.addIssue({
        code: "custom",
        path: ["alasanTidakAktif"],
        message: "Status meninggal harus diproses melalui modul Kematian.",
      });
    }
  });

export const jemaatListQuerySchema = z.object({
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
  wilayahId: z.string().uuid().optional(),

  jenisKelamin: jenisKelaminSchema.optional(),
  status: statusJemaatSchema.optional(),

  sortBy: z
    .enum(["nomorIndukGereja", "namaLengkap", "jenisKelamin", "status", "createdAt", "updatedAt"])
    .default("namaLengkap"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const jemaatIdSchema = z.string().uuid();

export type JemaatFormValues = z.infer<typeof jemaatFormSchema>;

export type JemaatListQuery = z.infer<typeof jemaatListQuerySchema>;

export type JenisKelaminValue = z.infer<typeof jenisKelaminSchema>;

export type StatusJemaatValue = z.infer<typeof statusJemaatSchema>;

export type AlasanTidakAktifValue = z.infer<typeof alasanTidakAktifSchema>;
