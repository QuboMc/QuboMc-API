export interface WebhookRegistration {
  url: string;
  event: string;
}

export interface WebhookPayload<T = any> {
  event: string;
  data: T;
} 