import { z } from 'zod';

export const CreateUserSchema = z.object({
  id: z.number().optional(), // optional for auto-generated
  name: z.string().nonempty(),
  income: z.number(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
