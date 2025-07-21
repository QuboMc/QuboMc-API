import { Request, Response } from 'express';
import { registerWebhook, listWebhooks } from '../services/webhookService';
import logger from '../utils/logger';

export async function registerWebhookHandler(req: Request, res: Response) {
  try {
    const { url, event } = req.body;
    registerWebhook({ url, event });
    logger.info(`Webhook registered for event '${event}' at URL: ${url}`);
    res.status(201).json({ success: true, registered: { url, event } });
  } catch (err: any) {
    logger.error('Failed to register webhook:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listWebhooksHandler(req: Request, res: Response) {
  try {
    const webhooks = listWebhooks();
    res.json(webhooks);
  } catch (err: any) {
    logger.error('Failed to list webhooks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 