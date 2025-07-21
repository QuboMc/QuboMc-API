import { Request, Response } from 'express';
import { Rcon } from 'rcon-client';
import logger from '../utils/logger';

const host = process.env.MINECRAFT_HOST!;
const port = Number(process.env.MINECRAFT_PORT!);
const password = process.env.MINECRAFT_RCON_PASSWORD!;

async function withRcon<T>(callback: (rcon: Rcon) => Promise<T>): Promise<T> {
  const rcon = new Rcon({ host, port, password });
  await rcon.connect();
  try {
    return await callback(rcon);
  } finally {
    rcon.end();
  }
}

export async function getStatus(req: Request, res: Response) {
  try {
    await withRcon(async () => {});
    res.json({ status: 'online' });
  } catch (err: any) {
    res.status(503).json({ status: 'offline', error: err.message });
  }
}

export async function sendCommand(req: Request, res: Response) {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Missing command' });
  try {
    const response = await withRcon(rcon => rcon.send(command));
    logger.info(`[Minecraft] Command sent: ${command}`);
    if (global.triggerWebhooks) {
      global.triggerWebhooks('minecraft_command', { command });
    }
    res.json({ response });
  } catch (err: any) {
    logger.error(`[Minecraft] Failed to send command: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

export async function listPlayers(req: Request, res: Response) {
  try {
    const response = await withRcon(rcon => rcon.send('list'));
    // Example parsing: 'There are 1/20 players online: Steve'
    const match = response.match(/players online: (.*)/);
    const players = match && match[1] ? match[1].split(',').map(p => p.trim()).filter(Boolean) : [];
    res.json({ players, raw: response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
} 