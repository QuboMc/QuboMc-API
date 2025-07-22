"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = getStatus;
exports.sendCommand = sendCommand;
exports.listPlayers = listPlayers;
const rcon_client_1 = require("rcon-client");
const logger_1 = __importDefault(require("../utils/logger"));
const host = process.env.MINECRAFT_HOST;
const port = Number(process.env.MINECRAFT_PORT);
const password = process.env.MINECRAFT_RCON_PASSWORD;
// Connection pool for better performance
class RconPool {
    constructor() {
        this.pool = [];
        this.maxConnections = 3;
    }
    async getConnection() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        const rcon = new rcon_client_1.Rcon({ host, port, password });
        await rcon.connect();
        return rcon;
    }
    releaseConnection(rcon) {
        if (this.pool.length < this.maxConnections) {
            this.pool.push(rcon);
        }
        else {
            rcon.end();
        }
    }
    async closeAll() {
        await Promise.all(this.pool.map(rcon => rcon.end()));
        this.pool = [];
    }
}
const rconPool = new RconPool();
async function withRcon(callback) {
    const rcon = await rconPool.getConnection();
    try {
        return await callback(rcon);
    }
    finally {
        rconPool.releaseConnection(rcon);
    }
}
async function getStatus(req, res) {
    try {
        await withRcon(async () => { });
        res.json({ status: 'online', timestamp: Date.now() });
    }
    catch (err) {
        logger_1.default.error(`Minecraft status check failed: ${err.message}`);
        res.status(503).json({ status: 'offline', error: err.message });
    }
}
async function sendCommand(req, res) {
    const { command } = req.body;
    if (!command) {
        res.status(400).json({ error: 'Missing command' });
        return;
    }
    try {
        const response = await withRcon(rcon => rcon.send(command));
        logger_1.default.info(`Minecraft command executed: ${command}`);
        if (global.triggerWebhooks) {
            global.triggerWebhooks('minecraft_command', { command, response });
        }
        res.json({ response, timestamp: Date.now() });
    }
    catch (err) {
        logger_1.default.error(`Minecraft command failed: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
async function listPlayers(req, res) {
    try {
        const response = await withRcon(rcon => rcon.send('list'));
        // Example parsing: 'There are 1/20 players online: Steve'
        const match = response.match(/There are (\d+)\/(\d+) players online(?:: (.*))?/);
        const online = match ? parseInt(match[1]) : 0;
        const max = match ? parseInt(match[2]) : 0;
        const playerList = match && match[3] ? match[3].split(',').map(p => p.trim()).filter(Boolean) : [];
        res.json({
            online,
            max,
            players: playerList,
            raw: response,
            timestamp: Date.now()
        });
    }
    catch (err) {
        logger_1.default.error(`Failed to list players: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
// Cleanup on process exit
process.on('SIGTERM', () => rconPool.closeAll());
process.on('SIGINT', () => rconPool.closeAll());
//# sourceMappingURL=minecraftController.js.map