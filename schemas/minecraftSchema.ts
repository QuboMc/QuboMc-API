import { z } from 'zod';

export const sendCommandSchema = z.object({
  body: z.object({
    command: z.string({
      required_error: 'Command is required',
    }).min(1, 'Command cannot be empty'),
  }),
}); 