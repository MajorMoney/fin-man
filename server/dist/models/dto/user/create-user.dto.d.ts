import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    income: z.ZodNumber;
}, z.core.$strip>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
