import { getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "skip",
  aliases: ["s", "next"],
  description: "Lewati lagu yang sedang diputar",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || !player.queue.current) {
      return message.reply("❌ Tidak ada lagu yang sedang diputar!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const skippedInfo = getTrackInfo(player.queue.current);
    const hasNext = player.queue.tracks.length > 0 || player.repeatMode !== "off";

    if (hasNext) {
      const nextTrack = player.queue.tracks[0] || player.queue.current;
      const nextInfo = getTrackInfo(nextTrack);
      await player.skip();
      await message.reply(`⏭️ Skipped **${skippedInfo.title}**\n🎵 Memutar selanjutnya: **${nextInfo.title}**`);
    } else {
      await player.stopPlaying(true, false);
      await message.reply(`⏭️ Skipped **${skippedInfo.title}**\n📭 Antrean sudah habis.`);
    }
  },
};
