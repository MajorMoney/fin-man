import { z } from 'zod';
import { CreateRecurringTransactionSchema } from './create-recurring-transaction';

export const UpdateRecurringTransactionSchema =
  CreateRecurringTransactionSchema.partial();
export type UpdateRecurringTransactionDto = z.infer<
  typeof UpdateRecurringTransactionSchema
>;
