import {
  createPlayer,
  getSourceEmoji,
  formatDuration,
  getTrackInfo,
  resolveUrlFallbackQuery,
} from "../utils/musicUtils.js";

export default {
  name: "play",
  aliases: ["p"],
  description: "Putar lagu dari YouTube, Spotify, SoundCloud, atau URL",
  usage: "<judul lagu / URL>",

  async execute(message, args, client, prefix) {
    if (!args.length) {
      return message.reply(`❌ Masukkan judul lagu atau link! Contoh: \`${prefix}p <judul lagu>\``);
    }

    const { player, error } = await createPlayer(message, client);
    if (error) return message.reply(error);

    const query = args.join(" ").trim();
    const isUrl = /^https?:\/\//i.test(query);
    const loadingMsg = await message.reply(`🔎 Mencari **${query}**...`);

    try {
      // 1. Try direct URL or YouTube search first
      let result = await player.search(
        isUrl ? { query } : { query, source: "ytsearch" },
        message.author
      );

      // 2. If a direct YouTube/Spotify URL failed to load on Lavalink, resolve its title via oEmbed and search
      if ((!result || !result.tracks || result.tracks.length === 0) && isUrl) {
        const fallbackQuery = await resolveUrlFallbackQuery(query);
        if (fallbackQuery) {
          result = await player.search(
            { query: fallbackQuery, source: "ytsearch" },
            message.author
          );
          if (!result || !result.tracks || result.tracks.length === 0) {
            result = await player.search(
              { query: fallbackQuery, source: "scsearch" },
              message.author
            );
          }
        }
      }

      // 3. Fallback to SoundCloud search for text queries if YouTube search returned empty
      if ((!result || !result.tracks || result.tracks.length === 0) && !isUrl) {
        result = await player.search(
          { query, source: "scsearch" },
          message.author
        );
      }

      if (!result || !result.tracks || result.tracks.length === 0) {
        if (result?.loadType === "error" && result?.exception?.message) {
          return loadingMsg.edit(`❌ Gagal memuat lagu dari Lavalink: \`${result.exception.message}\``);
        }
        return loadingMsg.edit("❌ Tidak ada lagu yang ditemukan!");
      }

      const isPlaylist = result.loadType === "playlist";
      const wasPlaying = player.playing || player.paused;

      if (isPlaylist) {
        player.queue.add(result.tracks);
      } else {
        player.queue.add(result.tracks[0]);
      }

      const firstTrack = result.tracks[0];
      const info = getTrackInfo(firstTrack);
      const emoji = getSourceEmoji(info.sourceName);

      // Start playback from queue without passing duplicate track object
      if (!player.playing && !player.paused) {
        await player.play();
      }

      if (isPlaylist) {
        const playlistTitle = result.playlist?.title || result.playlist?.name || "Playlist";
        await loadingMsg.edit(
          `🎶 **Playlist ditambahkan:** **${playlistTitle}** (${result.tracks.length} lagu)\n` +
          `${wasPlaying ? "Ditambahkan ke antrean" : "Mulai memutar"}: ${emoji} **${info.title}** — **${info.author}** (\`${formatDuration(info.duration)}\`)`
        );
      } else if (wasPlaying) {
        const position = player.queue.tracks.length;
        await loadingMsg.edit(
          `➕ **Ditambahkan ke antrean (#${position}):**\n` +
          `${emoji} **${info.title}** oleh **${info.author}** (\`${formatDuration(info.duration)}\`)`
        );
      } else {
        await loadingMsg.edit(
          `🎵 **Memutar sekarang:**\n` +
          `${emoji} **${info.title}** oleh **${info.author}** (\`${formatDuration(info.duration)}\`)`
        );
      }
    } catch (err) {
      console.error("Play command error:", err);
      await loadingMsg.edit("❌ Error saat memutar lagu: " + err.message);
    }
  },
};
