import { z } from 'zod';

export const QueryTransactionSchema = z.object({
  user: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  account: z.string().optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(),
});

export type QueryTransactionDto = z.infer<typeof QueryTransactionSchema>;
