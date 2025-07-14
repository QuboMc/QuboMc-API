const requiredVars = [
  'MINECRAFT_HOST',
  'MINECRAFT_PORT',
  'MINECRAFT_RCON_PASSWORD',
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID',
  'MOD_SECRET',
];

export function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 