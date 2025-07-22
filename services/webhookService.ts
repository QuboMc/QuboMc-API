import { WebhookRegistration, WebhookPayload } from '../types/webhook';
import logger from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const webhooksFilePath = path.join(__dirname, '../../webhooks.json');
let webhooks: WebhookRegistration[] = [];

async function loadWebhooks() {
  try {
    const data = await fs.readFile(webhooksFilePath, 'utf-8');
    webhooks = JSON.parse(data);
    logger.info(`Loaded ${webhooks.length} webhooks from file.`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.warn('webhooks.json not found. Starting with an empty list.');
      webhooks = [];
    } else {
      logger.error('Failed to load webhooks:', error);
    }
  }
}

async function saveWebhooks() {
  try {
    await fs.writeFile(webhooksFilePath, JSON.stringify(webhooks, null, 2));
  } catch (error) {
    logger.error('Failed to save webhooks:', error);
  }
}

export async function registerWebhook(reg: WebhookRegistration) {
  webhooks.push(reg);
  await saveWebhooks();
}

export function listWebhooks(): WebhookRegistration[] {
  return webhooks;
}

export async function triggerWebhooks<T>(event: string, data: T) {
  const promises = webhooks
    .filter(wh => wh.event === event)
    .map(async (wh) => {
      try {
        await fetch(wh.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data } as WebhookPayload<T>),
        });
        logger.info(`Webhook sent to ${wh.url} for event ${event}`);
      } catch (err: any) {
        logger.error(`Failed to send webhook to ${wh.url}:`, err.message);
      }
    });
  
  // Execute all webhook calls in parallel for better performance
  await Promise.allSettled(promises);
}

// Load webhooks on service initialization
loadWebhooks(); 