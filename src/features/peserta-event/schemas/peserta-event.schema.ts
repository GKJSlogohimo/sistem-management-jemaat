import { z } from "zod";

export const jenisPesertaSchema = z.enum(["JEMAAT", "NON_JEMAAT"]);

export const statusPesertaEventSchema = z.enum([
  "TERCATAT",
  "HADIR",
  "MENUNGGU",
  "DIPANGGIL",
  "SELESAI",
  "BATAL",
]);

export const pesertaEventFormSchema = z
  .object({
    jenisPeserta: jenisPesertaSchema,

    jemaatId: z.string(),

    nik: z
      .string()
      .trim()
      .refine((value) => value === "" || /^[0-9]{16}$/.test(value), {
        message: "NIK harus terdiri dari tepat 16 digit angka.",
      }),

    namaLengkap: z.string().trim().max(150, "Nama lengkap maksimal 150 karakter."),

    jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]).nullable(),

    tempatLahir: z.string().trim().max(100, "Tempat lahir maksimal 100 karakter."),

    tanggalLahir: z.string().refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Format tanggal lahir tidak valid.",
    }),

    alamat: z.string().trim().max(500, "Alamat maksimal 500 karakter."),

    noHp: z
      .string()
      .trim()
      .max(30, "Nomor HP maksimal 30 karakter.")
      .refine((value) => value === "" || /^[0-9+\-()\s]+$/.test(value), {
        message: "Format nomor HP tidak valid.",
      }),

    email: z
      .string()
      .trim()
      .max(150, "Email maksimal 150 karakter.")
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "Format email tidak valid.",
      }),

    keterangan: z.string().trim().max(500, "Keterangan maksimal 500 karakter."),

    catatan: z.string().trim().max(500, "Catatan maksimal 500 karakter."),
  })
  .superRefine((values, context) => {
    if (values.jenisPeserta === "JEMAAT" && !z.string().uuid().safeParse(values.jemaatId).success) {
      context.addIssue({
        code: "custom",
        path: ["jemaatId"],
        message: "Data Jemaat wajib dipilih.",
      });
    }

    if (values.jenisPeserta === "NON_JEMAAT" && values.namaLengkap.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["namaLengkap"],
        message: "Nama peserta minimal 2 karakter.",
      });
    }

    if (values.tanggalLahir) {
      const tanggalLahir = new Date(`${values.tanggalLahir}T00:00:00.000Z`);

      if (Number.isNaN(tanggalLahir.getTime()) || tanggalLahir > new Date()) {
        context.addIssue({
          code: "custom",
          path: ["tanggalLahir"],
          message: "Tanggal lahir tidak valid.",
        });
      }
    }
  });

export const pesertaEventListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce
    .number()
    .int()
    .refine((value) => [10, 20, 30, 50].includes(value), {
      message: "Jumlah data per halaman tidak valid.",
    })
    .default(10),

  jenisPeserta: jenisPesertaSchema.optional(),

  status: statusPesertaEventSchema.optional(),

  sortBy: z
    .enum(["namaPesertaSnapshot", "nomorAntrian", "status", "waktuTercatat", "updatedAt"])
    .default("waktuTercatat"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const jemaatEventOptionsQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
});

export const pesertaEventIdSchema = z.string().uuid();

export type PesertaEventFormValues = z.infer<typeof pesertaEventFormSchema>;

export type PesertaEventListQuery = z.infer<typeof pesertaEventListQuerySchema>;

export type JenisPesertaValue = z.infer<typeof jenisPesertaSchema>;

export type StatusPesertaEventValue = z.infer<typeof statusPesertaEventSchema>;
