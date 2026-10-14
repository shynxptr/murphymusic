import { ActivityType } from "discord.js";

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`\n🎵 ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds\n`);

    // Set presence - Jockie Music style
    client.user.setPresence({
      activities: [{ name: "🎵 Music", type: ActivityType.Listening }],
      status: "online",
    });
  },
};
