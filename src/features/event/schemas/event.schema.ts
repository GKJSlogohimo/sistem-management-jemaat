import { z } from "zod";

export const jenisEventSchema = z.enum(["UMUM", "REGISTRASI"]);

export const statusEventSchema = z.enum(["DRAFT", "DIBUKA", "DITUTUP", "DIBATALKAN"]);

const dateTimeLocalSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Format tanggal dan waktu tidak valid.");

const optionalDateTimeLocalSchema = z
  .string()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), {
    message: "Format tanggal dan waktu tidak valid.",
  });

export const eventFormSchema = z
  .object({
    unitGerejaId: z.string().min(1, "Unit Gereja wajib dipilih.").uuid("Unit Gereja tidak valid."),

    kategoriEventId: z
      .string()
      .min(1, "Kategori Event wajib dipilih.")
      .uuid("Kategori Event tidak valid."),

    nama: z
      .string()
      .trim()
      .min(1, "Nama Event wajib diisi.")
      .min(3, "Nama Event minimal 3 karakter.")
      .max(200, "Nama Event maksimal 200 karakter."),

    deskripsi: z.string().trim().max(1000, "Deskripsi maksimal 1.000 karakter."),

    jenis: jenisEventSchema,

    lokasi: z.string().trim().max(300, "Lokasi maksimal 300 karakter."),

    tanggalMulai: dateTimeLocalSchema,

    tanggalSelesai: optionalDateTimeLocalSchema,

    kapasitas: z
      .number()
      .int("Kapasitas harus berupa angka bulat.")
      .positive("Kapasitas harus lebih dari nol.")
      .nullable(),

    status: statusEventSchema,

    gunakanPencatatanPeserta: z.boolean(),
    gunakanCheckIn: z.boolean(),
    gunakanAntrean: z.boolean(),
    izinkanNonJemaat: z.boolean(),
  })
  .superRefine((values, context) => {
    const mulai = new Date(`${values.tanggalMulai}:00+07:00`);

    if (Number.isNaN(mulai.getTime())) {
      context.addIssue({
        code: "custom",
        path: ["tanggalMulai"],
        message: "Tanggal mulai tidak valid.",
      });
    }

    if (values.tanggalSelesai) {
      const selesai = new Date(`${values.tanggalSelesai}:00+07:00`);

      if (Number.isNaN(selesai.getTime()) || selesai < mulai) {
        context.addIssue({
          code: "custom",
          path: ["tanggalSelesai"],
          message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
        });
      }
    }

    if (values.jenis === "REGISTRASI" && !values.gunakanPencatatanPeserta) {
      context.addIssue({
        code: "custom",
        path: ["gunakanPencatatanPeserta"],
        message: "Event registrasi wajib menggunakan pencatatan peserta.",
      });
    }

    if (values.gunakanCheckIn && !values.gunakanPencatatanPeserta) {
      context.addIssue({
        code: "custom",
        path: ["gunakanCheckIn"],
        message: "Check-in memerlukan pencatatan peserta.",
      });
    }

    if (values.gunakanAntrean && !values.gunakanCheckIn) {
      context.addIssue({
        code: "custom",
        path: ["gunakanAntrean"],
        message: "Antrean memerlukan fitur check-in.",
      });
    }

    if (values.izinkanNonJemaat && !values.gunakanPencatatanPeserta) {
      context.addIssue({
        code: "custom",
        path: ["izinkanNonJemaat"],
        message: "Peserta nonjemaat memerlukan pencatatan peserta.",
      });
    }
  });

export const eventListQuerySchema = z.object({
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

  kategoriEventId: z.string().uuid().optional(),

  jenis: jenisEventSchema.optional(),
  status: statusEventSchema.optional(),

  sortBy: z
    .enum(["nama", "tanggalMulai", "status", "jenis", "createdAt", "updatedAt"])
    .default("tanggalMulai"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const eventIdSchema = z.string().uuid();

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventListQuery = z.infer<typeof eventListQuerySchema>;

export type JenisEventValue = z.infer<typeof jenisEventSchema>;

export type StatusEventValue = z.infer<typeof statusEventSchema>;
