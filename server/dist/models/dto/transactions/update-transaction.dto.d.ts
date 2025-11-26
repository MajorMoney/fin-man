import { z } from 'zod';
export declare const UpdateTransactionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    type: z.ZodOptional<z.ZodEnum<{
        income: "income";
        expense: "expense";
    }>>;
    date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    account: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    user: z.ZodOptional<z.ZodString>;
    recurring: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    recurrenceRule: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
