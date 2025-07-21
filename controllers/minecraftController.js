// controllers/minecraftController.js

const { Rcon } = require('rcon-client');

const host = process.env.MINECRAFT_HOST;
const port = Number(process.env.MINECRAFT_PORT);
const password = process.env.MINECRAFT_RCON_PASSWORD;

async function withRcon(callback) {
  const rcon = new Rcon({ host, port, password });
  await rcon.connect();
  try {
    return await callback(rcon);
  } finally {
    rcon.end();
  }
}

exports.getStatus = async (req, res) => {
  try {
    await withRcon(async () => {});
    res.json({ status: 'online' });
  } catch (err) {
    res.status(503).json({ status: 'offline', error: err.message });
  }
};

exports.sendCommand = async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Missing command' });
  try {
    const response = await withRcon(rcon => rcon.send(command));
    console.log(`[Minecraft] Command sent: ${command}`);
    if (global.triggerWebhooks) {
      global.triggerWebhooks('minecraft_command', { command });
    }
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listPlayers = async (req, res) => {
  try {
    const response = await withRcon(rcon => rcon.send('list'));
    // Example parsing: 'There are 1/20 players online: Steve'
    const match = response.match(/players online: (.*)/);
    const players = match && match[1] ? match[1].split(',').map(p => p.trim()).filter(Boolean) : [];
    res.json({ players, raw: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 