import { z } from 'zod';
export declare const CreateCategorySchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    type: z.ZodString;
}, z.core.$strip>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
