import { z } from 'zod';
export declare const UpdateIncomeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    account: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    recurring: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    recurrenceRule: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    user: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateIncomeDto = z.infer<typeof UpdateIncomeSchema>;
