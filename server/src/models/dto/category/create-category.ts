import { z } from 'zod';

export const CreateCategorySchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  type: z.string().nonempty(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
