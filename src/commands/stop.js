import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing and clear the queue"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ content: "❌ Bot tidak sedang play!", ephemeral: true });
    }

    player.queue.clear();
    await player.stop();
    await player.destroy();

    await interaction.reply("⏹️ Stopped & cleared queue. Disconnected from voice channel.");
  },
};
