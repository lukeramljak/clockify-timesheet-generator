import { z } from 'zod';

export const formSchema = z.object({
  apiKey: z.string().min(1, { error: 'API key is required' })
});

export type FormSchema = typeof formSchema;
