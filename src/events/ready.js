import { ActivityType } from "discord.js";
import { DEFAULT_PREFIX } from "../utils/prefixManager.js";

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`\n🎵 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds\n`);

    // Initialize Lavalink manager once bot is ready
    await client.lavalink.init({
      id: client.user.id,
      username: client.user.username,
    });

    // Set presence - Jockie Music style
    client.user.setPresence({
      activities: [{ name: `${DEFAULT_PREFIX}help | ${DEFAULT_PREFIX}p`, type: ActivityType.Listening }],
      status: "online",
    });
  },
};
