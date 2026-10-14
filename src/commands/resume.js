import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.paused) {
      return interaction.reply({ content: "❌ Player tidak sedang pause!", ephemeral: true });
    }

    await player.setPaused(false);
    await interaction.reply(`▶️ Resumed **${player.queue.current?.title}**`);
  },
};
