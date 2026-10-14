import { SlashCommandBuilder } from "discord.js";
import { getTrackInfo } from "../utils/musicUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ content: "❌ Tidak ada lagu yang sedang diputar!", ephemeral: true });
    }

    const skippedInfo = getTrackInfo(player.queue.current);
    await player.skip();

    const next = player.queue.current;
    if (next) {
      const nextInfo = getTrackInfo(next);
      await interaction.reply(`⏭️ Skipped **${skippedInfo.title}**\n🎵 Now playing: **${nextInfo.title}**`);
    } else {
      await interaction.reply(`⏭️ Skipped **${skippedInfo.title}**\n📭 Queue sudah habis`);
    }
  },
};
