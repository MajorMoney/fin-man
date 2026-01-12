// src/models/dto/recurring/create-recurring-transaction.dto.ts
import { z } from 'zod';

export const CreateRecurringTransactionSchema = z.object({
  id: z.number().optional(), // optional, can be generated automatically
  startDate: z.string().nonempty(), // first occurrence
  description: z.string().nonempty(),
  amount: z.number(),
  currency: z.string().optional(),
  account: z.string(),
  category: z.string(),
  notes: z.string().optional(),
  user: z.string().nonempty(),
  recurrenceRule: z.string().nonempty(), // RRULE string required for recurring
  endDate: z.string().optional(), // optional cutoff
});

export type CreateRecurringTransactionDto = z.infer<
  typeof CreateRecurringTransactionSchema
>;
