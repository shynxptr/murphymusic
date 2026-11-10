import {
  createPlayer,
  getSourceEmoji,
  formatDuration,
  getTrackInfo,
  validateVoiceControl,
  hasPlayableTracks,
} from "../utils/musicUtils.js";

export default {
  name: "search",
  aliases: ["find", "sc"],
  description: "Cari lagu dan pilih lewat ketik nomor (1-10)",
  usage: "<judul lagu>",

  async execute(message, args, client, prefix) {
    const query = args.join(" ").trim();
    if (!query) {
      return message.reply(`❌ Masukkan judul lagu yang ingin dicari! Contoh: \`${prefix}search <judul lagu>\``);
    }

    const { player, error } = await createPlayer(message, client);
    if (error) return message.reply(error);

    const searchMsg = await message.reply(`🔎 Mencari **${query}**...`);

    try {
      const resolveIdentifier = async (identifier) => {
        if (player.node?.rest?.resolve) {
          return await player.node.rest.resolve(identifier);
        }
        return await player.node.request(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);
      };

      let res = await resolveIdentifier(`ytmsearch:${query}`);
      if (!hasPlayableTracks(res)) {
        res = await resolveIdentifier(`ytsearch:${query}`);
      }
      if (!hasPlayableTracks(res)) {
        res = await resolveIdentifier(`scsearch:${query}`);
      }

      if (!hasPlayableTracks(res)) {
        return searchMsg.edit("❌ Lagu tidak ditemukan!");
      }

      const rawTracks =
        res.loadType === "playlist"
          ? res.data.tracks
          : Array.isArray(res.data)
            ? res.data
            : [res.data];

      const buildTrack = (t) =>
        player.LavalinkManager?.utils?.buildTrack
          ? player.LavalinkManager.utils.buildTrack(t, message.author)
          : { ...t, requester: message.author };

      const tracks = rawTracks.slice(0, 10).map(buildTrack);
      const listText = tracks
        .map((track, i) => {
          const info = getTrackInfo(track);
          const emoji = getSourceEmoji(info.sourceName);
          return `\`${(i + 1).toString().padStart(2, " ")}.\` ${emoji} **${info.title}** — ${info.author} (\`${formatDuration(info.duration)}\`)`;
        })
        .join("\n");

      const embed = {
        color: 0x2b2d31,
        title: `🔎 Hasil Pencarian: "${query}"`,
        description: listText,
        footer: {
          text: "Ketik angka 1 - " + tracks.length + " di chat untuk memilih lagu, atau ketik 'batal' (30 detik)",
        },
      };

      await searchMsg.edit({ content: null, embeds: [embed] });

      const filter = (m) => m.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 30_000,
        max: 1,
      });

      collector.on("collect", async (replyMsg) => {
        const content = replyMsg.content.trim().toLowerCase();
        if (content === "batal" || content === "cancel" || content === "c") {
          await searchMsg.edit({ content: "❌ Pencarian dibatalkan.", embeds: [] }).catch(() => {});
          return;
        }

        const index = parseInt(content, 10);
        if (isNaN(index) || index < 1 || index > tracks.length) {
          await searchMsg.edit({ content: "❌ Pilihan tidak valid. Pencarian dibatalkan.", embeds: [] }).catch(() => {});
          return;
        }

        const currentPlayer = client.lavalink.getPlayer(message.guild.id);
        if (!currentPlayer) {
          await searchMsg.edit({ content: `❌ Player sudah tidak aktif! Gunakan \`${prefix}p\` lagi.`, embeds: [] }).catch(() => {});
          return;
        }

        const voiceErr = validateVoiceControl(message, currentPlayer);
        if (voiceErr) {
          await searchMsg.edit({ content: voiceErr, embeds: [] }).catch(() => {});
          return;
        }

        const selectedTrack = tracks[index - 1];
        const wasPlaying = currentPlayer.playing || currentPlayer.paused;
        currentPlayer.queue.add(selectedTrack);

        if (!currentPlayer.playing && !currentPlayer.paused) {
          await currentPlayer.play();
        }

        const info = getTrackInfo(selectedTrack);
        const emoji = getSourceEmoji(info.sourceName);
        const positionText = wasPlaying ? ` (Antrean #${currentPlayer.queue.tracks.length})` : "";

        await searchMsg
          .edit({
            content: `${wasPlaying ? "➕ **Ditambahkan ke antrean:**" : "🎵 **Memutar sekarang:**"}\n${emoji} **${info.title}** oleh **${info.author}** (\`${formatDuration(info.duration)}\`)${positionText}`,
            embeds: [],
          })
          .catch(() => {});
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          searchMsg.edit({ content: "⌛ Waktu memilih lagu habis (30 detik).", embeds: [] }).catch(() => {});
        }
      });
    } catch (err) {
      console.error("Search command error:", err);
      await searchMsg.edit("❌ Error: " + err.message);
    }
  },
};
