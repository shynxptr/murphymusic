import { getSourceEmoji, formatDuration, getTrackInfo } from "../utils/musicUtils.js";

export default {
  name: "queue",
  aliases: ["q", "list"],
  description: "Tampilkan daftar antrean lagu",
  usage: "[halaman]",

  async execute(message, args, client, prefix) {
    const player = client.lavalink.getPlayer(message.guild.id);

    if (!player || (!player.queue.tracks.length && !player.queue.current)) {
      return message.reply("📭 Antrean kosong!");
    }

    const current = player.queue.current;
    const tracks = player.queue.tracks;
    const currentInfo = getTrackInfo(current);
    const emoji = getSourceEmoji(currentInfo.sourceName);

    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(tracks.length / perPage));
    const requestedPage = parseInt(args[0], 10) || 1;
    const page = Math.min(Math.max(requestedPage, 1), totalPages);

    let description = "";

    // Currently playing
    if (current) {
      description += `🎵 **Sedang Diputar**\n${emoji} **${currentInfo.title}** — **${currentInfo.author}**\n`;
      description += `⏱️ \`${formatDuration(player.position)} / ${formatDuration(currentInfo.duration)}\`\n\n`;
    }

    // Upcoming tracks for requested page
    if (tracks.length > 0) {
      const start = (page - 1) * perPage;
      const slice = tracks.slice(start, start + perPage);

      description += `📜 **Antrean Selanjutnya (${tracks.length} lagu)**\n`;
      for (let i = 0; i < slice.length; i++) {
        const idx = start + i + 1;
        const tInfo = getTrackInfo(slice[i]);
        const tEmoji = getSourceEmoji(tInfo.sourceName);
        description += `\`${idx.toString().padStart(2, " ")}.\` ${tEmoji} **${tInfo.title}** — \`${formatDuration(tInfo.duration)}\`\n`;
      }

      if (totalPages > 1) {
        description += `\n*Halaman ${page}/${totalPages} — ketik \`${prefix}q ${page < totalPages ? page + 1 : 1}\` untuk halaman lain*`;
      }
    }

    // Total queue duration
    const totalDuration =
      tracks.reduce((sum, t) => sum + (getTrackInfo(t).duration || 0), 0) +
      (currentInfo.duration || 0);

    const embed = {
      color: 0x2b2d31,
      title: "🎵 Music Queue",
      description: description || "Antrean kosong",
      footer: {
        text: `Total: ${tracks.length + (current ? 1 : 0)} lagu • Durasi: ${formatDuration(totalDuration)} • Loop: ${player.repeatMode}`,
      },
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  },
};
