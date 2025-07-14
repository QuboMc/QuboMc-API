import { WebhookRegistration, WebhookPayload } from '../types/webhook';

const webhooks: WebhookRegistration[] = [];

export function registerWebhook(reg: WebhookRegistration) {
  webhooks.push(reg);
}

export function listWebhooks(): WebhookRegistration[] {
  return webhooks;
}

export async function triggerWebhooks<T>(event: string, data: T) {
  const fetch = (...args: any[]) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  for (const wh of webhooks) {
    if (wh.event === event) {
      try {
        await fetch(wh.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data } as WebhookPayload<T>),
        });
        console.log(`Webhook sent to ${wh.url} for event ${event}`);
      } catch (err: any) {
        console.error(`Failed to send webhook to ${wh.url}:`, err.message);
      }
    }
  }
} 