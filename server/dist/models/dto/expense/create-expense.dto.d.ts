import { z } from 'zod';
export declare const CreateExpenseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    date: z.ZodString;
    description: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    account: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    user: z.ZodString;
}, z.core.$strip>;
export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>;
