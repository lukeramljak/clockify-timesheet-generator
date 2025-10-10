import z from 'zod';

export const formSchema = z.object({
  resource: z.string().regex(/^[A-Z]{3}$/, { message: 'Resource must be 3 uppercase characters' }),
  callNo: z.string().regex(/^net\d{5}$/, { error: 'Must begin with net and contain 5 numbers' }),
  weekEnding: z.string(),
  includeProjectName: z.boolean()
});

export type FormSchema = typeof formSchema;
