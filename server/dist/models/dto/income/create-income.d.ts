import { z } from 'zod';
export declare const CreateIncomeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    date: z.ZodString;
    description: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    account: z.ZodString;
    category: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    recurring: z.ZodOptional<z.ZodBoolean>;
    recurrenceRule: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    user: z.ZodString;
}, z.core.$strip>;
export type CreateIncomeDto = z.infer<typeof CreateIncomeSchema>;
