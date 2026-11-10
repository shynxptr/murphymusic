import { getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "remove",
  aliases: ["rm", "delete"],
  description: "Hapus lagu dari antrean berdasarkan nomor urut",
  usage: "<nomor>",

  async execute(message, args, client, prefix) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || player.queue.tracks.length === 0) {
      return message.reply("❌ Antrean sedang kosong!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const position = parseInt(args[0], 10);
    if (isNaN(position) || position < 1) {
      return message.reply(`❌ Masukkan nomor urut lagu yang valid! Contoh: \`${prefix}rm 1\``);
    }

    if (position > player.queue.tracks.length) {
      return message.reply(
        `❌ Tidak ada lagu di posisi #${position}! Antrean hanya punya **${player.queue.tracks.length}** lagu.`
      );
    }

    const removed = player.queue.tracks[position - 1];
    const removedInfo = getTrackInfo(removed);
    await player.queue.remove(position - 1);

    await message.reply(`🗑️ Menghapus **${removedInfo.title}** dari posisi #${position}`);
  },
};
