import "dotenv/config";
import { LavalinkManager } from "lavalink-client";

// Lavalink manager - handles all audio playback, similar to how Jockie Music
// connects to multiple Lavalink nodes for load balancing
export const manager = new LavalinkManager({
  nodes: [
    {
      id: "main-node",
      host: process.env.LAVALINK_HOST || "localhost",
      port: parseInt(process.env.LAVALINK_PORT || "2333"),
      authorization: process.env.LAVALINK_PASSWORD || "yournamelavalink",
      secure: process.env.LAVALINK_SECURE === "true",
      retryAmount: 5,
      retryDelay: 5000,
      // Options for better stability (Jockie-like behavior)
      resumeStatus: true,
    },
  ],
  // Send audio data to Discord voice gateway
  sendToShard: (guildId, payload) => {
    const guild = client?.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  // Auto resume player if bot restarts
  autoSkip: true,
  // Queue options
  queue: {
    maxPreviousTracks: 100, // Jockie stores history
  },
  // Player options
  defaultVolume: 100,
  client: {
    id: process.env.CLIENT_ID,
    username: "Music Bot",
  },
  // Spotify support (if credentials provided)
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || undefined,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || undefined,
  },
  // Auto resolve tracks from URLs
  autoResolveSources: true,
});

// Need access to client for shard sending - imported dynamically to avoid circular dependency
let client = null;
export function setClient(c) {
  client = c;
}
