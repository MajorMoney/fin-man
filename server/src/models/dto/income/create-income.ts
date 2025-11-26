import { z } from 'zod';

export const CreateIncomeSchema = z.object({
  id: z.number().optional(),
  date: z.string().nonempty(),
  description: z.string().nonempty(),
  amount: z.number(),
  currency: z.string().optional(),
  account: z.string(),
  category: z.string(),
  source: z.string().optional(),
  recurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  notes: z.string().optional(),
  user: z.string().nonempty(),
});

export type CreateIncomeDto = z.infer<typeof CreateIncomeSchema>;
