declare global {
  var triggerWebhooks: <T>(event: string, data: T) => Promise<void>;
}

export {};