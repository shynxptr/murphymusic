import { getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "pause",
  aliases: ["pa"],
  description: "Jeda lagu yang sedang diputar",
  usage: "",

  async execute(message, args, client, prefix) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || !player.playing) {
      return message.reply("❌ Tidak ada lagu yang sedang diputar!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const info = getTrackInfo(player.queue.current);
    await player.pause();
    await message.reply(`⏸️ Paused **${info.title}**\nKetik \`${prefix}r\` atau \`${prefix}resume\` untuk melanjutkan.`);
  },
};
