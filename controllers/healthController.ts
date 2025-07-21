import { Request, Response } from 'express';
import { Rcon } from 'rcon-client';
import { Client as DiscordClient } from 'discord.js';

// Assume discord client is exported from discordController or a central place
// For now, let's create a mock reference.
// In a real app, you'd import the actual client instance.
let discordClient: DiscordClient;
try {
  discordClient = require('./discordController').client;
} catch {
  // Mock client if discord controller is not set up
  discordClient = { user: null } as any;
}


async function checkMinecraft() {
  try {
    const rcon = new Rcon({
      host: process.env.MINECRAFT_HOST!,
      port: Number(process.env.MINECRAFT_PORT!),
      password: process.env.MINECRAFT_RCON_PASSWORD!,
    });
    await rcon.connect();
    await rcon.end();
    return { status: 'ok' };
  } catch (err: any) {
    return { status: 'error', message: err.message };
  }
}

async function checkDiscord() {
  if (discordClient && discordClient.user) {
    return { status: 'ok' };
  }
  return { status: 'error', message: 'Discord client not connected' };
}

export async function getHealth(req: Request, res: Response) {
  const [minecraft, discord] = await Promise.all([
    checkMinecraft(),
    checkDiscord(),
  ]);

  const isHealthy = minecraft.status === 'ok' && discord.status === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    details: {
      minecraft,
      discord,
    },
  });
} 