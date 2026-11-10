import {
  createPlayer,
  getSourceEmoji,
  formatDuration,
  getTrackInfo,
  resolveUrlFallbackQuery,
  hasPlayableTracks,
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
        const res = player.node?.rest?.resolve
          ? await player.node.rest.resolve(identifier)
          : await player.node.request(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);

        if (res?.loadType === "error") {
          console.warn(`[Lavalink] loadType=error for "${identifier}":`, res.data);
        }
        return res;
      };

      let res = await resolveIdentifier(searchString);

      // Jika bukan URL dan ytmsearch kosong/error, coba ytsearch lalu scsearch
      if (!hasPlayableTracks(res) && !isUrl) {
        res = await resolveIdentifier(`ytsearch:${query}`);
        if (!hasPlayableTracks(res)) {
          res = await resolveIdentifier(`scsearch:${query}`);
        }
      }

      // Jika input adalah URL namun gagal dimuat langsung oleh Lavalink, coba cari via judul oEmbed
      if (!hasPlayableTracks(res) && isUrl) {
        const fallbackTitle = await resolveUrlFallbackQuery(query);
        if (fallbackTitle) {
          console.log(`[Play] Direct URL failed, falling back to title search: "${fallbackTitle}"`);
          res = await resolveIdentifier(`ytmsearch:${fallbackTitle}`);
          if (!hasPlayableTracks(res)) {
            res = await resolveIdentifier(`ytsearch:${fallbackTitle}`);
          }
          if (!hasPlayableTracks(res)) {
            res = await resolveIdentifier(`scsearch:${fallbackTitle}`);
          }
        }
      }

      if (!hasPlayableTracks(res)) {
        return loadingMsg.edit("❌ Lagu atau link tidak ditemukan!");
      }

      // Lanjutkan proses pemutaran trek
      const rawTrack =
        res.loadType === "playlist"
          ? res.data.tracks[0]
          : Array.isArray(res.data)
            ? res.data[0]
            : res.data;

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
