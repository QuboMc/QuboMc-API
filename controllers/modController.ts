import { Request, Response } from 'express';
import logger from '../utils/logger';

const modSecret = process.env.MOD_SECRET!;

export async function getStatus(req: Request, res: Response): Promise<void> {
  res.json({ status: 'Mod API ready' });
}

export async function handleModEvent(req: Request, res: Response): Promise<void> {
  const { secret, event, data } = req.body;
  if (!secret || secret !== modSecret) {
    res.status(401).json({ error: 'Invalid or missing secret' });
    return;
  }
  if (!event) {
    res.status(400).json({ error: 'Missing event type' });
    return;
  }
  logger.info(`[Mod] Event received: ${event}`, data);
  if (global.triggerWebhooks) {
    global.triggerWebhooks('mod_event', { event, data });
  }
  res.json({ received: { event, data } });
} 