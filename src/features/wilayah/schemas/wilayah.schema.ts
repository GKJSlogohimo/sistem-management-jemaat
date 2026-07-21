import { z } from "zod";

export const wilayahFormSchema = z.object({
  unitGerejaId: z.string().min(1, "Unit gereja wajib dipilih.").uuid("Unit gereja tidak valid."),

  nama: z
    .string()
    .trim()
    .min(1, "Nama wilayah wajib diisi.")
    .min(2, "Nama wilayah minimal 2 karakter.")
    .max(150, "Nama wilayah maksimal 150 karakter."),

  keterangan: z.string().trim().max(500, "Keterangan maksimal 500 karakter."),
});

export const wilayahListQuerySchema = z.object({
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

  sortBy: z.enum(["nama", "unitGereja", "createdAt", "updatedAt"]).default("nama"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const wilayahIdSchema = z.string().uuid();

export type WilayahFormValues = z.infer<typeof wilayahFormSchema>;

export type WilayahListQuery = z.infer<typeof wilayahListQuerySchema>;
