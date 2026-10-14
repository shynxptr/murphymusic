import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the current queue"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || player.queue.tracks.length < 2) {
      return interaction.reply({ content: "❌ Tidak cukup lagu di queue untuk di-shuffle!", ephemeral: true });
    }

    await player.queue.shuffle();
    await interaction.reply(`🔀 Queue di-shuffle! ${player.queue.tracks.length} tracks`);
  },
};
