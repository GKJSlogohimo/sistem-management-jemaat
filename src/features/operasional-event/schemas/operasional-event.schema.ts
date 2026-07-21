import { z } from "zod";

export const operasionalEventQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
});

const pesertaIdSchema = z.string().uuid();

export const operasionalEventActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CHECK_IN"),
    pesertaId: pesertaIdSchema,

    nomorAntrian: z.number().int().positive().nullable(),
  }),

  z.object({
    action: z.literal("PANGGIL"),
    pesertaId: pesertaIdSchema,
  }),

  z.object({
    action: z.literal("PANGGIL_BERIKUTNYA"),
  }),

  z.object({
    action: z.literal("KEMBALIKAN"),
    pesertaId: pesertaIdSchema,
  }),

  z.object({
    action: z.literal("SELESAI"),
    pesertaId: pesertaIdSchema,
  }),

  z.object({
    action: z.literal("BATAL"),
    pesertaId: pesertaIdSchema,
  }),
]);

export type OperasionalEventActionInput = z.infer<typeof operasionalEventActionSchema>;

export type OperasionalEventAction = OperasionalEventActionInput["action"];
