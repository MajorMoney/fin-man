import { z } from 'zod';
export declare const CreateTransactionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    type: z.ZodEnum<{
        income: "income";
        expense: "expense";
    }>;
    date: z.ZodString;
    description: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    account: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    user: z.ZodString;
    recurring: z.ZodOptional<z.ZodBoolean>;
    recurrenceRule: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
