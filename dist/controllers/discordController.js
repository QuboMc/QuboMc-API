"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = getStatus;
exports.sendMessage = sendMessage;
exports.botInfo = botInfo;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../utils/logger"));
const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages] });
client.login(token);
async function getStatus(req, res) {
    try {
        if (client.user) {
            res.json({ status: 'online', username: client.user.username, id: client.user.id });
        }
        else {
            res.status(503).json({ status: 'offline' });
        }
    }
    catch (err) {
        res.status(503).json({ status: 'offline', error: err.message });
    }
}
async function sendMessage(req, res) {
    const { channelId, message } = req.body;
    if (!channelId || !message)
        return res.status(400).json({ error: 'Missing channelId or message' });
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !(channel instanceof discord_js_1.TextChannel))
            throw new Error('Channel not found or not a text channel');
        await channel.send(message);
        logger_1.default.info(`[Discord] Message sent to channel ${channelId}: ${message}`);
        if (global.triggerWebhooks) {
            global.triggerWebhooks('discord_send_message', { channelId, message });
        }
        res.json({ success: true });
    }
    catch (err) {
        logger_1.default.error(`[Discord] Failed to send message: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
async function botInfo(req, res) {
    try {
        if (client.user) {
            const info = { username: client.user.username, id: client.user.id };
            if (global.triggerWebhooks) {
                global.triggerWebhooks('discord_bot_info', info);
            }
            res.json(info);
        }
        else {
            throw new Error('Bot not logged in');
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
