import { Events } from "discord.js";

// Handle raw voice state updates for Lavalink
// Lavalink needs raw voice payloads to connect to voice channels
export default {
  name: "raw",
  async execute(payload, client) {
    // Pass voice-related payloads to Lavalink
    if (
      payload.t === "VOICE_SERVER_UPDATE" ||
      payload.t === "VOICE_STATE_UPDATE"
    ) {
      client.lavalink.sendRawPayload(payload.d.guild_id, payload);
    }
  },
};
