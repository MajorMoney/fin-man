import { z } from 'zod';
export declare const UpdateUserSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    name: z.ZodOptional<z.ZodString>;
    income: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
