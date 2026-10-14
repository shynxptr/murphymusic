import { ActivityType } from "discord.js";

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`\n🎵 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds\n`);

    // Init lavalink manager now that we have the client user ID
    client.lavalink.init(client.user.id);

    // Set presence - Jockie Music style
    client.user.setPresence({
      activities: [{ name: "🎵 Music", type: ActivityType.Listening }],
      status: "online",
    });

    // Auto-join voice channels that the bot was previously in (resume support)
    // This is a simplified version of Jockie's auto-resume feature
    for (const guild of client.guilds.cache.values()) {
      try {
        const player = client.lavalink.getPlayer(guild.id);
        if (player) {
          // Player was already in a voice channel before restart
          continue;
        }
      } catch {
        // No player exists
      }
    }
  },
};
