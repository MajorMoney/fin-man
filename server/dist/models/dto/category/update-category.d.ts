import { z } from 'zod';
export declare const UpdateCategorySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
