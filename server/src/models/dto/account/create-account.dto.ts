import { z } from 'zod';

export const CreateAccountSchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty(),
  holdings: z.number(),
  holders: z.array(z.string()).min(1, 'Accounts must have at least one holder'),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
