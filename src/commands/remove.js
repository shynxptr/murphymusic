import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue by position")
    .addIntegerOption(option =>
      option
        .setName("position")
        .setDescription("Position number in queue (1-based)")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || player.queue.tracks.length === 0) {
      return interaction.reply({ content: "❌ Queue kosong!", ephemeral: true });
    }

    const position = interaction.options.getInteger("position");

    if (position > player.queue.tracks.length) {
      return interaction.reply({
        content: `❌ Tidak ada lagu di posisi ${position}! Queue hanya punya ${player.queue.tracks.length} lagu.`,
        ephemeral: true,
      });
    }

    const removed = player.queue.tracks[position - 1];
    player.queue.removeTracks(position - 1);

    await interaction.reply(`🗑️ Removed **${removed.title}** dari posisi #${position}`);
  },
};
