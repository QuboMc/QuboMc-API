import { Request, Response } from 'express';
import logger from '../utils/logger';

const modSecret = process.env.MOD_SECRET!;

export async function getStatus(req: Request, res: Response) {
  res.json({ status: 'Mod API ready' });
}

export async function handleEvent(req: Request, res: Response) {
  const { secret, event, data } = req.body;
  if (!secret || secret !== modSecret) {
    return res.status(401).json({ error: 'Invalid or missing secret' });
  }
  if (!event) {
    return res.status(400).json({ error: 'Missing event type' });
  }
  logger.info(`[Mod] Event received: ${event}`, data);
  if (global.triggerWebhooks) {
    global.triggerWebhooks('mod_event', { event, data });
  }
  res.json({ received: { event, data } });
} 