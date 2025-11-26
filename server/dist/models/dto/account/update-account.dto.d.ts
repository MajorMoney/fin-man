import { z } from 'zod';
export declare const UpdateAccountSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    name: z.ZodOptional<z.ZodString>;
    holdings: z.ZodOptional<z.ZodNumber>;
    holders: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
