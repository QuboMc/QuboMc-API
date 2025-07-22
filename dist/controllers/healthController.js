"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
const rcon_client_1 = require("rcon-client");
// Assume discord client is exported from discordController or a central place
// For now, let's create a mock reference.
// In a real app, you'd import the actual client instance.
let discordClient;
try {
    discordClient = require('./discordController').client;
}
catch {
    // Mock client if discord controller is not set up
    discordClient = { user: null };
}
async function checkMinecraft() {
    try {
        const rcon = new rcon_client_1.Rcon({
            host: process.env.MINECRAFT_HOST,
            port: Number(process.env.MINECRAFT_PORT),
            password: process.env.MINECRAFT_RCON_PASSWORD,
        });
        await rcon.connect();
        await rcon.end();
        return { status: 'ok' };
    }
    catch (err) {
        return { status: 'error', message: err.message };
    }
}
async function checkDiscord() {
    if (discordClient && discordClient.user) {
        return { status: 'ok' };
    }
    return { status: 'error', message: 'Discord client not connected' };
}
async function getHealth(req, res) {
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
