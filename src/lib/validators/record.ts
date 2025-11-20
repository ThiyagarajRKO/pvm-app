import { z } from 'zod';

export const recordCreateSchema = z.object({
  slNo: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  date: z.string().optional(),
  name: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  fatherName: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  street: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  place: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
  weightGrams: z.preprocess((v) => Number(v), z.number().positive()),
  itemType: z.enum(['Gold', 'Silver']),
  itemCategory: z.enum(['active', 'archived', 'big']),
  amount: z.preprocess((v) => Number(v), z.number().nonnegative()),
  mobile: z.string().regex(/^[0-9]{10}$/),
  personImageUrl: z.string().url().optional().nullable(),
  itemImageUrl: z.string().url().optional().nullable(),
  itemReturnImageUrl: z.string().url().optional().nullable(),
});

export const recordUpdateSchema = recordCreateSchema.partial();

export type RecordCreateInput = z.infer<typeof recordCreateSchema>;
export type RecordUpdateInput = z.infer<typeof recordUpdateSchema>;
