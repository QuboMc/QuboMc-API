import { z } from 'zod';

export const handleEventSchema = z.object({
  body: z.object({
    secret: z.string({ required_error: 'secret is required' }),
    event: z.string({ required_error: 'event is required' }),
    data: z.any().optional(),
  }),
}); 