import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ content: "❌ Tidak ada lagu yang sedang diputar!", ephemeral: true });
    }

    const skipped = player.queue.current.title;
    await player.skip();

    const next = player.queue.current;
    if (next) {
      await interaction.reply(`⏭️ Skipped **${skipped}**\n🎵 Now playing: **${next.title}**`);
    } else {
      await interaction.reply(`⏭️ Skipped **${skipped}**\n📭 Queue sudah habis`);
    }
  },
};
