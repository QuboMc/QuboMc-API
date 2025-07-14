// controllers/minecraftController.js

// Uncomment after installing rcon-client:
// const { Rcon } = require('rcon-client');

const host = process.env.MINECRAFT_HOST;
const port = process.env.MINECRAFT_PORT;
const password = process.env.MINECRAFT_RCON_PASSWORD;

// Helper to connect to RCON (uncomment Rcon after install)
async function withRcon(callback) {
  // const rcon = new Rcon({ host, port, password });
  // await rcon.connect();
  // try {
  //   return await callback(rcon);
  // } finally {
  //   rcon.end();
  // }
  // Remove the below line after enabling Rcon
  throw new Error('RCON logic not enabled. Uncomment code after installing rcon-client.');
}

exports.getStatus = async (req, res) => {
  // Example: Try to connect to RCON and return status
  try {
    // await withRcon(async (rcon) => {});
    // res.json({ status: 'online' });
    throw new Error('RCON logic not enabled.');
  } catch (err) {
    res.status(503).json({ status: 'offline', error: err.message });
  }
};

exports.sendCommand = async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Missing command' });
  try {
    // const response = await withRcon(rcon => rcon.send(command));
    // Log the command
    console.log(`[Minecraft] Command sent: ${command}`);
    // Trigger webhooks for 'minecraft_command' event
    if (global.triggerWebhooks) {
      global.triggerWebhooks('minecraft_command', { command });
    }
    // res.json({ response });
    throw new Error('RCON logic not enabled.');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listPlayers = async (req, res) => {
  try {
    // const response = await withRcon(rcon => rcon.send('list'));
    // Parse response for player names
    // res.json({ players: [...], raw: response });
    throw new Error('RCON logic not enabled.');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 