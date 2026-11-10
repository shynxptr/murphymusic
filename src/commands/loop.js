import { getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "loop",
  aliases: ["repeat", "l"],
  description: "Atur mode loop (off / track / queue)",
  usage: "[off|track|queue]",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player) {
      return message.reply("❌ Bot sedang tidak memutar musik!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    const input = args[0]?.toLowerCase();
    let mode;

    if (!input) {
      // Cycle mode if no argument given: off -> track -> queue -> off
      mode =
        player.repeatMode === "off"
          ? "track"
          : player.repeatMode === "track"
            ? "queue"
            : "off";
    } else if (["off", "none", "0", "mati"].includes(input)) {
      mode = "off";
    } else if (["track", "song", "t", "1", "lagu"].includes(input)) {
      mode = "track";
    } else if (["queue", "all", "q", "2", "semua"].includes(input)) {
      mode = "queue";
    } else {
      return message.reply("❌ Mode tidak valid! Gunakan: `off`, `track`, atau `queue`.");
    }

    await player.setRepeatMode(mode);

    if (mode === "off") {
      await message.reply("🔁 Loop **dimatikan**.");
    } else if (mode === "track") {
      const info = getTrackInfo(player.queue.current);
      await message.reply(`🔂 Loop **track** diaktifkan untuk: **${info.title}**`);
    } else {
      await message.reply("🔁 Loop **queue** diaktifkan! Semua lagu di antrean akan diulang.");
    }
  },
};
