import { Request, Response } from 'express';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import logger from '../utils/logger';

const token = process.env.DISCORD_BOT_TOKEN!;

// Singleton Discord client with proper error handling
class DiscordManager {
  private static instance: DiscordManager;
  private client: Client;
  private isReady = false;

  private constructor() {
    this.client = new Client({ 
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
    });
    
    this.client.once('ready', () => {
      this.isReady = true;
      logger.info(`Discord bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
      this.isReady = false;
    });

    this.client.on('disconnect', () => {
      logger.warn('Discord client disconnected');
      this.isReady = false;
    });

    this.login();
  }

  static getInstance(): DiscordManager {
    if (!DiscordManager.instance) {
      DiscordManager.instance = new DiscordManager();
    }
    return DiscordManager.instance;
  }

  private async login() {
    try {
      await this.client.login(token);
    } catch (error) {
      logger.error('Failed to login to Discord:', error);
      // Retry after 30 seconds
      setTimeout(() => this.login(), 30000);
    }
  }

  getClient(): Client {
    return this.client;
  }

  isClientReady(): boolean {
    return this.isReady && this.client.user !== null;
  }
}

const discordManager = DiscordManager.getInstance();

export async function getStatus(req: Request, res: Response): Promise<void> {
  try {
    const client = discordManager.getClient();
    if (discordManager.isClientReady() && client.user) {
      res.json({ 
        status: 'online', 
        username: client.user.username, 
        id: client.user.id,
        guilds: client.guilds.cache.size,
        timestamp: Date.now()
      });
    } else {
      res.status(503).json({ status: 'offline' });
    }
  } catch (err: any) {
    logger.error(`Discord status check failed: ${err.message}`);
    res.status(503).json({ status: 'offline', error: err.message });
  }
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { channelId, message } = req.body;
  if (!channelId || !message) {
    res.status(400).json({ error: 'Missing channelId or message' });
    return;
  }

  try {
    if (!discordManager.isClientReady()) {
      res.status(503).json({ error: 'Discord bot is not ready' });
      return;
    }

    const client = discordManager.getClient();
    const channel = await client.channels.fetch(channelId);
    
    if (!channel || !(channel instanceof TextChannel)) {
      res.status(404).json({ error: 'Channel not found or not a text channel' });
      return;
    }

    const sentMessage = await channel.send(message);
    logger.info(`Discord message sent to channel ${channelId}: ${message}`);
    
    if (global.triggerWebhooks) {
      global.triggerWebhooks('discord_send_message', { 
        channelId, 
        message, 
        messageId: sentMessage.id 
      });
    }
    
    res.json({ 
      success: true, 
      messageId: sentMessage.id,
      timestamp: Date.now()
    });
  } catch (err: any) {
    logger.error(`Failed to send Discord message: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

export async function botInfo(req: Request, res: Response): Promise<void> {
  try {
    const client = discordManager.getClient();
    if (discordManager.isClientReady() && client.user) {
      const info = { 
        username: client.user.username, 
        id: client.user.id,
        guilds: client.guilds.cache.size,
        uptime: client.uptime,
        timestamp: Date.now()
      };
      
      if (global.triggerWebhooks) {
        global.triggerWebhooks('discord_bot_info', info);
      }
      
      res.json(info);
    } else {
      res.status(503).json({ error: 'Bot not logged in' });
    }
  } catch (err: any) {
    logger.error(`Failed to get Discord bot info: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
} 