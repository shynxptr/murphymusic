import { validateVoiceControl, clearPlayerTimeouts } from "../utils/musicUtils.js";

export default {
  name: "stop",
  aliases: ["leave", "dc", "disconnect"],
  description: "Hentikan musik, hapus antrean, dan keluar dari voice channel",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      return message.reply("❌ Bot sedang tidak memutar musik!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    clearPlayerTimeouts(player);
    await player.destroy();

    await message.reply("⏹️ Musik dihentikan, antrean dibersihkan, dan keluar dari voice channel.");
  },
};
