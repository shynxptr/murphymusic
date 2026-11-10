import { getTrackInfo, getSourceEmoji, formatDuration, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "previous",
  aliases: ["prev", "back", "b"],
  description: "Putar kembali lagu sebelumnya",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      return message.reply("❌ Bot sedang tidak memutar musik!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    if (!player.queue.previous || player.queue.previous.length === 0) {
      return message.reply("❌ Tidak ada riwayat lagu sebelumnya!");
    }

    const prevTrack = await player.queue.shiftPrevious();
    if (!prevTrack) {
      return message.reply("❌ Tidak ada riwayat lagu sebelumnya!");
    }

    // Put current track back at the front of the queue if one is playing
    if (player.queue.current) {
      await player.queue.add(player.queue.current, 0);
    }

    await player.play({ clientTrack: prevTrack });

    const info = getTrackInfo(prevTrack);
    const emoji = getSourceEmoji(info.sourceName);
    await message.reply(
      `⏮️ Memutar lagu sebelumnya:\n${emoji} **${info.title}** oleh **${info.author}** (\`${formatDuration(info.duration)}\`)`
    );
  },
};
