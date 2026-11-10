import { validateVoiceControl } from "../utils/musicUtils.js";

export default {
  name: "shuffle",
  aliases: ["sh", "mix"],
  description: "Acak urutan lagu di dalam antrean",
  usage: "",

  async execute(message, args, client) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || player.queue.tracks.length < 2) {
      return message.reply("❌ Minimal harus ada 2 lagu di antrean untuk di-shuffle!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    await player.queue.shuffle();
    await message.reply(`🔀 Antrean berhasil di-shuffle! (**${player.queue.tracks.length}** lagu)`);
  },
};
