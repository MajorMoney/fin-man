import { z } from 'zod';
import { CreateIncomeSchema } from './create-income';

export const UpdateIncomeSchema = CreateIncomeSchema.partial();
export type UpdateIncomeDto = z.infer<typeof UpdateIncomeSchema>;
