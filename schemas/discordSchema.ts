import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    channelId: z.string({ required_error: 'channelId is required' }),
    message: z.string({ required_error: 'message is required' }).min(1, 'Message cannot be empty'),
  }),
}); 