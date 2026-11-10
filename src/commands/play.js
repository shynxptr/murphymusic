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
    const query = args.join(" ").trim();
    if (!query) {
      return message.reply(`❌ Masukkan judul lagu atau link YouTube! Contoh: \`${prefix}p <judul lagu>\``);
    }

    const { player, error } = await createPlayer(message, client);
    if (error) return message.reply(error);

    // Cek apakah input adalah URL yang valid
    const isUrl = query.match(
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    );

    // Jika URL, gunakan langsung. Jika bukan, gunakan ytmsearch/ytsearch.
    const searchString = isUrl ? query : `ytmsearch:${query}`;
    const loadingMsg = await message.reply(`🔎 Mencari **${query}**...`);

    try {
      const resolveIdentifier = async (identifier) => {
        if (player.node?.rest?.resolve) {
          return await player.node.rest.resolve(identifier);
        }
        return await player.node.request(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);
      };

      let res = await resolveIdentifier(searchString);

      // Jika bukan URL dan ytmsearch kosong/error, coba ytsearch lalu scsearch
      if ((!res || res.loadType === "empty" || res.loadType === "error") && !isUrl) {
        res = await resolveIdentifier(`ytsearch:${query}`);
        if (!res || res.loadType === "empty" || res.loadType === "error") {
          res = await resolveIdentifier(`scsearch:${query}`);
        }
      }

      // Jika input adalah URL namun gagal dimuat langsung oleh Lavalink, coba cari via judul oEmbed
      if ((!res || res.loadType === "empty" || res.loadType === "error") && isUrl) {
        const fallbackTitle = await resolveUrlFallbackQuery(query);
        if (fallbackTitle) {
          res = await resolveIdentifier(`ytmsearch:${fallbackTitle}`);
          if (!res || res.loadType === "empty" || res.loadType === "error") {
            res = await resolveIdentifier(`ytsearch:${fallbackTitle}`);
          }
          if (!res || res.loadType === "empty" || res.loadType === "error") {
            res = await resolveIdentifier(`scsearch:${fallbackTitle}`);
          }
        }
      }

      if (!res || res.loadType === "empty" || res.loadType === "error") {
        return loadingMsg.edit("❌ Lagu atau link tidak ditemukan!");
      }

      // Lanjutkan proses pemutaran trek
      const rawTrack = res.loadType === "playlist" ? res.data.tracks[0] : res.data[0] || res.data;
      if (!rawTrack) {
        return loadingMsg.edit("❌ Lagu atau link tidak ditemukan!");
      }

      const buildTrack = (t) =>
        player.LavalinkManager?.utils?.buildTrack
          ? player.LavalinkManager.utils.buildTrack(t, message.author)
          : { ...t, requester: message.author };

      const track = buildTrack(rawTrack);
      const isPlaylist = res.loadType === "playlist";
      const wasPlaying = player.playing || player.paused;

      if (isPlaylist && Array.isArray(res.data.tracks)) {
        const playlistTracks = res.data.tracks.map(buildTrack);
        player.queue.add(playlistTracks);
      } else {
        player.queue.add(track);
      }

      const info = getTrackInfo(track);
      const emoji = getSourceEmoji(info.sourceName);

      if (!player.playing && !player.paused) {
        await player.play();
      }

      if (isPlaylist) {
        const playlistTitle = res.data?.info?.name || "Playlist";
        const count = res.data?.tracks?.length || 1;
        await loadingMsg.edit(
          `🎶 **Playlist ditambahkan:** **${playlistTitle}** (${count} lagu)\n` +
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
