import { getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "resume",
  aliases: ["r", "unpause"],
  description: "Lanjutkan lagu yang sedang dijeda",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || !player.paused) {
      return message.reply("❌ Player sedang tidak di-pause!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const info = getTrackInfo(player.queue.current);
    await player.resume();
    await message.reply(`▶️ Melanjutkan **${info.title}**`);
  },
};
