import { z } from 'zod';
import { CreateExpenseSchema } from './create-expense.dto';

export const UpdateExpenseSchema = CreateExpenseSchema.partial();
export type UpdateExpenseDto = z.infer<typeof UpdateExpenseSchema>;
