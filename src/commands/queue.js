import { SlashCommandBuilder } from "discord.js";
import { getSourceEmoji, formatDuration, getTrackInfo } from "../utils/musicUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);

    if (!player || (!player.queue.tracks.length && !player.queue.current)) {
      return interaction.reply({ content: "📭 Queue kosong!", ephemeral: true });
    }

    const current = player.queue.current;
    const tracks = player.queue.tracks;
    const currentInfo = getTrackInfo(current);
    const emoji = getSourceEmoji(currentInfo.sourceName);

    let description = "";

    // Currently playing
    if (current) {
      description += `🎵 **Now Playing**\n${emoji} **${currentInfo.title}** by **${currentInfo.author}**\n`;
      description += `⏱️ ${formatDuration(player.position)} / ${formatDuration(currentInfo.duration)}\n\n`;
    }

    // Upcoming tracks
    if (tracks.length > 0) {
      description += `📜 **Up Next (${tracks.length})**\n`;
      const maxShow = 15;
      const slice = tracks.slice(0, maxShow);

      for (let i = 0; i < slice.length; i++) {
        const tInfo = getTrackInfo(slice[i]);
        const tEmoji = getSourceEmoji(tInfo.sourceName);
        description += `\`${(i + 1).toString().padStart(2, " ")}.\` ${tEmoji} **${tInfo.title}** — ${formatDuration(tInfo.duration)}\n`;
      }

      if (tracks.length > maxShow) {
        description += `\n*...dan ${tracks.length - maxShow} lagu lagi*`;
      }
    }

    // Total queue duration
    const totalDuration = tracks.reduce((sum, t) => sum + (getTrackInfo(t).duration || 0), 0) + (currentInfo.duration || 0);

    const embed = {
      color: 0x2b2d31,
      title: "🎵 Music Queue",
      description: description || "Queue kosong",
      footer: { text: `Total: ${tracks.length + 1} tracks • ${formatDuration(totalDuration)} • Loop: ${player.repeatMode}` },
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};
