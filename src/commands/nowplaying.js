import { getSourceEmoji, formatDuration, createProgressBar, getTrackInfo } from "../utils/musicUtils.js";

export default {
  name: "nowplaying",
  aliases: ["np", "current"],
  description: "Tampilkan detail lagu yang sedang diputar",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || !player.queue.current) {
      return message.reply("❌ Tidak ada lagu yang sedang diputar!");
    }

    const track = player.queue.current;
    const info = getTrackInfo(track);
    const emoji = getSourceEmoji(info.sourceName);
    const progress = createProgressBar(player.position, info.duration);

    const loopText =
      player.repeatMode === "track"
        ? "\n🔂 Loop: Track"
        : player.repeatMode === "queue"
          ? "\n🔁 Loop: Queue"
          : "";

    const embed = {
      color: 0x2b2d31,
      title: "🎵 Now Playing",
      description:
        `${emoji} **${info.title}**\n` +
        `👤 ${info.author}${loopText}\n\n` +
        `${progress}\n` +
        `\`${formatDuration(player.position)}\` / \`${formatDuration(info.duration)}\``,
      thumbnail: info.artworkUrl ? { url: info.artworkUrl } : undefined,
      footer: {
        text:
          `Requested by ${track.requester?.tag || track.requester?.username || "Unknown"}` +
          ` • Volume: ${player.volume}%` +
          ` • Antrean: ${player.queue.tracks.length} lagu`,
      },
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  },
};
