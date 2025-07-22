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
// Singleton Discord client with proper error handling
class DiscordManager {
    constructor() {
        this.isReady = false;
        this.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages]
        });
        this.client.once('ready', () => {
            this.isReady = true;
            logger_1.default.info(`Discord bot logged in as ${this.client.user?.tag}`);
        });
        this.client.on('error', (error) => {
            logger_1.default.error('Discord client error:', error);
            this.isReady = false;
        });
        this.client.on('disconnect', () => {
            logger_1.default.warn('Discord client disconnected');
            this.isReady = false;
        });
        this.login();
    }
    static getInstance() {
        if (!DiscordManager.instance) {
            DiscordManager.instance = new DiscordManager();
        }
        return DiscordManager.instance;
    }
    async login() {
        try {
            await this.client.login(token);
        }
        catch (error) {
            logger_1.default.error('Failed to login to Discord:', error);
            // Retry after 30 seconds
            setTimeout(() => this.login(), 30000);
        }
    }
    getClient() {
        return this.client;
    }
    isClientReady() {
        return this.isReady && this.client.user !== null;
    }
}
const discordManager = DiscordManager.getInstance();
async function getStatus(req, res) {
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
        }
        else {
            res.status(503).json({ status: 'offline' });
        }
    }
    catch (err) {
        logger_1.default.error(`Discord status check failed: ${err.message}`);
        res.status(503).json({ status: 'offline', error: err.message });
    }
}
async function sendMessage(req, res) {
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
        if (!channel || !(channel instanceof discord_js_1.TextChannel)) {
            res.status(404).json({ error: 'Channel not found or not a text channel' });
            return;
        }
        const sentMessage = await channel.send(message);
        logger_1.default.info(`Discord message sent to channel ${channelId}: ${message}`);
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
    }
    catch (err) {
        logger_1.default.error(`Failed to send Discord message: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
async function botInfo(req, res) {
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
        }
        else {
            res.status(503).json({ error: 'Bot not logged in' });
        }
    }
    catch (err) {
        logger_1.default.error(`Failed to get Discord bot info: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=discordController.js.map