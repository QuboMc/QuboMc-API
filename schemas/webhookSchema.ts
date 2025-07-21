import { z } from 'zod';

export const registerWebhookSchema = z.object({
  body: z.object({
    url: z.string().url('Must be a valid URL'),
    event: z.string().min(1, 'Event name is required'),
  }),
}); 