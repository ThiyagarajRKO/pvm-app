import { z } from 'zod';

export const recordCreateSchema = z.object({
  slNo: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  date: z.string().optional(),
  name: z
    .string()
    .optional()
    .transform((s) => s?.trim() || ''),
  fatherName: z
    .string()
    .optional()
    .transform((s) => s?.trim() || ''),
  street: z
    .string()
    .optional()
    .transform((s) => s?.trim() || ''),
  place: z
    .string()
    .optional()
    .transform((s) => s?.trim() || ''),
  item: z
    .string()
    .optional()
    .transform((s) => s?.trim() || ''),
  weightGrams: z.preprocess((v) => Number(v), z.number().positive()).optional(),
  itemType: z.enum(['Gold', 'Silver']).optional(),
  itemCategory: z.enum(['active', 'archived', 'big']).optional(),
  amount: z.preprocess((v) => Number(v), z.number().nonnegative()).optional(),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/)
    .optional()
    .or(z.literal('')),
  personImageUrl: z.string().url().optional().nullable(),
  itemImageUrl: z.string().url().optional().nullable(),
  itemReturnImageUrl: z.string().url().optional().nullable(),
});

export const recordUpdateSchema = recordCreateSchema.partial().extend({
  isReturned: z.boolean().optional(),
  returnedAmount: z
    .preprocess(
      (v) => (v === null ? null : Number(v)),
      z.number().nonnegative().nullable()
    )
    .optional(),
  returnedDate: z.date().nullable().optional(),
});

export type RecordCreateInput = z.infer<typeof recordCreateSchema>;
export type RecordUpdateInput = z.infer<typeof recordUpdateSchema>;
