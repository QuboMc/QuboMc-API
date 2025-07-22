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
async function withRcon(callback) {
    const rcon = new rcon_client_1.Rcon({ host, port, password });
    await rcon.connect();
    try {
        return await callback(rcon);
    }
    finally {
        rcon.end();
    }
}
async function getStatus(req, res) {
    try {
        await withRcon(async () => { });
        res.json({ status: 'online' });
    }
    catch (err) {
        res.status(503).json({ status: 'offline', error: err.message });
    }
}
async function sendCommand(req, res) {
    const { command } = req.body;
    if (!command)
        return res.status(400).json({ error: 'Missing command' });
    try {
        const response = await withRcon(rcon => rcon.send(command));
        logger_1.default.info(`[Minecraft] Command sent: ${command}`);
        if (global.triggerWebhooks) {
            global.triggerWebhooks('minecraft_command', { command });
        }
        res.json({ response });
    }
    catch (err) {
        logger_1.default.error(`[Minecraft] Failed to send command: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}
async function listPlayers(req, res) {
    try {
        const response = await withRcon(rcon => rcon.send('list'));
        // Example parsing: 'There are 1/20 players online: Steve'
        const match = response.match(/players online: (.*)/);
        const players = match && match[1] ? match[1].split(',').map(p => p.trim()).filter(Boolean) : [];
        res.json({ players, raw: response });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
