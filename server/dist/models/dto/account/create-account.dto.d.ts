import { z } from 'zod';
export declare const CreateAccountSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    holdings: z.ZodNumber;
    holders: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
