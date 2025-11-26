import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['income', 'expense']), // distinguishes income vs expense
  date: z.string().nonempty(),
  description: z.string().nonempty(),
  amount: z.number(),
  currency: z.string().optional(),
  account: z.string().optional(),
  category: z.string().nonempty(),
  notes: z.string().optional(),
  user: z.string().nonempty(),
  recurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
