import { SlashCommandBuilder } from "discord.js";
import { getSourceEmoji, formatDuration, createProgressBar } from "../utils/musicUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song"),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.queue.current) {
      return interaction.reply({ content: "❌ Tidak ada lagu yang sedang diputar!", ephemeral: true });
    }

    const track = player.queue.current;
    const emoji = getSourceEmoji(track.sourceName);
    const progress = createProgressBar(player.position, track.duration);

    const loopText = player.repeatMode === "track" ? " 🔂" : player.repeatMode === "queue" ? " 🔁" : "";

    const embed = {
      color: 0x2b2d31,
      title: "🎵 Now Playing",
      description:
        `${emoji} **${track.title}**\n` +
        `👤 ${track.author}\n` +
        `${loopText}\n` +
        `\n${progress}\n` +
        `\`${formatDuration(player.position)}\` / \`${formatDuration(track.duration)}\``,
      thumbnail: { url: track.artworkUrl || null },
      footer: {
        text: `Requested by ${track.requester?.tag || "Unknown"}` +
          ` • Volume: ${player.volume}%` +
          ` • Queue: ${player.queue.tracks.length} tracks`,
      },
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};
