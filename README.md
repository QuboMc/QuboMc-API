# QuboMc-API

A unified API to connect and manage your QuboMc Minecraft server, QuboDc Discord bot, and Qubo mod. This project aims to simplify management and integration between your Minecraft server, Discord bot, and custom mod.

## Features
- REST API endpoints for Minecraft, Discord, and Mod integration
- Centralized error handling and request logging
- Simple in-memory rate limiting (60 requests/minute per IP)
- Webhook registration and event triggers for real-time integrations

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (comes with Node.js)

### Installation
```bash
npm install
```

### Running the API
```bash
node index.js
```

## Project Structure
- `index.js` - Main entry point for the API server
- `routes/` - API route definitions (to be created)
- `controllers/` - Logic for handling API requests (to be created)

## Example Endpoints
- `/minecraft/status` - Get Minecraft server status
- `/discord/send-message` - Send a message via Discord bot
- `/mod/event` - Communicate with Qubo mod

## Example API Requests

### Minecraft
- **Get server status:**
  ```bash
  curl https://qubomc.net/minecraft/status
  ```
- **Send command:**
  ```bash
  curl -X POST https://qubomc.net/minecraft/command \
    -H "Content-Type: application/json" \
    -d '{"command": "say Hello from API!"}'
  ```
- **List players:**
  ```bash
  curl https://qubomc.net/minecraft/players
  ```

### Discord
- **Get bot status:**
  ```bash
  curl https://qubomc.net/discord/status
  ```
- **Send message:**
  ```bash
  curl -X POST https://qubomc.net/discord/send-message \
    -H "Content-Type: application/json" \
    -d '{"channelId": "YOUR_CHANNEL_ID", "message": "Hello from API!"}'
  ```
- **Get bot info:**
  ```bash
  curl https://qubomc.net/discord/bot-info
  ```

### Mod
- **Get mod status:**
  ```bash
  curl https://qubomc.net/mod/status
  ```
- **Send event:**
  ```bash
  curl -X POST https://qubomc.net/mod/event \
    -H "Content-Type: application/json" \
    -d '{"secret": "YOUR_MOD_SECRET", "event": "custom_event", "data": {"foo": "bar"}}'
  ```

## API Endpoints

### Minecraft
- `GET /minecraft/status` — Placeholder for server status
- `POST /minecraft/command` — Placeholder for sending a command to the server
- `GET /minecraft/players` — Placeholder for listing online players

### Discord
- `GET /discord/status` — Placeholder for bot status
- `POST /discord/send-message` — Placeholder for sending a message via the bot
- `GET /discord/bot-info` — Placeholder for bot info

### Mod
- `GET /mod/status` — Placeholder for mod status
- `POST /mod/event` — Placeholder for mod events

## Controllers
For better code organization, you can move the business logic out of the route files and into separate controller files (e.g., `controllers/minecraftController.js`). The route files will then just call functions from these controllers.

## Configuration

Copy `.env.example` to `.env` and fill in your secrets and configuration values:

```bash
cp .env.example .env
```

Edit `.env` with your Minecraft server info, Discord bot token, and any other secrets. Never commit your real `.env` file to public repositories!

## .gitignore

This project includes a `.gitignore` file to prevent committing sensitive or unnecessary files:
- `node_modules/` — Node.js dependencies
- `.env` — Environment variables and secrets
- `*.log`, `logs/` — Log files
- OS and editor files (e.g., `.DS_Store`, `Thumbs.db`)

**Never commit your real `.env` file or log files to a public repository!**

## Next Steps (when you can install packages)
- Install dependencies for Minecraft (e.g., rcon-client), Discord (discord.js), and any other integrations.
- Replace the TODOs in the route files with actual logic.
- Deploy to your server and update your domain (triomart.xyz) DNS when ready.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE) 

## TypeScript Modules & Advanced Features

### Shared Types
- `types/events.ts`: Type definitions for Minecraft, Discord, and Mod events.
- `types/webhook.ts`: Type definitions for webhook registration and payloads.

### Utilities
- `utils/validateEnv.ts`: Validates required environment variables at startup. Usage:
  ```ts
  import { validateEnv } from './utils/validateEnv';
  validateEnv(); // Throws if any required env var is missing
  ```

### Middleware
- `middleware/auth.ts`: Express middleware for API key authentication. Usage:
  ```ts
  import { apiKeyAuth } from './middleware/auth';
  app.use(apiKeyAuth); // Protects all routes
  // or
  app.get('/protected', apiKeyAuth, handler);
  ```
  Add your API key to `.env` as `API_KEY=your_key_here`.

### Services
- `services/webhookService.ts`: Service for registering, listing, and triggering webhooks. Usage:
  ```ts
  import { registerWebhook, listWebhooks, triggerWebhooks } from './services/webhookService';
  registerWebhook({ url: 'https://example.com', event: 'minecraft_command' });
  await triggerWebhooks('minecraft_command', { command: 'say Hello' });
  ```

### TypeScript Best Practices
- Use `.ts` files for new modules and features.
- Use type definitions for request bodies, events, and configs.
- Run `tsc` to compile TypeScript to JavaScript before deploying.
- Keep shared types in the `types/` directory for easy reuse. 
