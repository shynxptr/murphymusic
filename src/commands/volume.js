import { validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "volume",
  aliases: ["vol", "v"],
  description: "Cek atau ubah volume musik (0-150)",
  usage: "[0-150]",

  async execute(message, args, client, prefix) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      return message.reply("❌ Bot sedang tidak memutar musik!");
    }

    if (!args.length) {
      return message.reply(`🔊 Volume saat ini: **${player.volume}%**\nKetik \`${prefix}v <0-150>\` untuk mengubah volume.`);
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const level = parseInt(args[0], 10);
    if (isNaN(level) || level < 0 || level > 150) {
      return message.reply("❌ Masukkan angka volume antara **0** sampai **150**!");
    }

    await player.setVolume(level);
    await message.reply(`🔊 Volume diset ke **${level}%**`);
  },
};
