import { validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "clear",
  aliases: ["cl", "empty"],
  description: "Bersihkan seluruh antrean lagu tanpa menghentikan lagu yang sedang diputar",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || player.queue.tracks.length === 0) {
      return message.reply("❌ Antrean sedang kosong!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const count = player.queue.tracks.length;
    await player.queue.splice(0, count);

    await message.reply(`🧹 Berhasil menghapus **${count}** lagu dari antrean!`);
  },
};
