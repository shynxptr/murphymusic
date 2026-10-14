import "dotenv/config";
import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { manager, setClient } from "./lavalink.js";
import { loadCommands, handleInteraction } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";

// Bot client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});

// Set client reference for lavalink manager (for shard.send)
setClient(client);

// Store the manager on client for access in commands
client.lavalink = manager;

// Load commands and events
await loadCommands(client);
await loadEvents(client);

// Login
await client.login(process.env.DISCORD_TOKEN);

export { client };
