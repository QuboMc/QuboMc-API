// controllers/discordController.js

const { Client, GatewayIntentBits, TextChannel } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.login(token);

exports.getStatus = async (req, res) => {
  try {
    if (client.user) {
      res.json({ status: 'online', username: client.user.username, id: client.user.id });
    } else {
      res.status(503).json({ status: 'offline' });
    }
  } catch (err) {
    res.status(503).json({ status: 'offline', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { channelId, message } = req.body;
  if (!channelId || !message) return res.status(400).json({ error: 'Missing channelId or message' });
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) throw new Error('Channel not found or not a text channel');
    await channel.send(message);
    console.log(`[Discord] Message sent to channel ${channelId}: ${message}`);
    if (global.triggerWebhooks) {
      global.triggerWebhooks('discord_send_message', { channelId, message });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.botInfo = async (req, res) => {
  try {
    if (client.user) {
      const info = { username: client.user.username, id: client.user.id };
      if (global.triggerWebhooks) {
        global.triggerWebhooks('discord_bot_info', info);
      }
      res.json(info);
    } else {
      throw new Error('Bot not logged in');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 