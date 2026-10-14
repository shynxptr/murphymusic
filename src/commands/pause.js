import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.playing) {
      return interaction.reply({ content: "❌ Tidak ada lagu yang sedang diputar!", ephemeral: true });
    }

    await player.setPaused(true);
    await interaction.reply(`⏸️ Paused **${player.queue.current?.title}**\nGunakan /resume untuk lanjut`);
  },
};
