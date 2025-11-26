import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  id: z.number().optional(),
  date: z.string().nonempty(),
  description: z.string().nonempty(),
  amount: z.number(),
  currency: z.string().optional(),
  account: z.string().optional(),
  category: z.string().nonempty(),
  notes: z.string().optional(),
  user: z.string().nonempty(),
});

export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>;
