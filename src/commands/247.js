import { createPlayer, validateVoiceControl, clearPlayerTimeouts } from "../utils/musicUtils.js";

export default {
  name: "247",
  aliases: ["stay", "24/7"],
  description: "Aktifkan/matikan mode 24/7 (bot tetap di voice channel meski antrean habis)",
  usage: "",

  async execute(message, args, client) {
    let player = client.lavalink.getPlayer(message.guild.id);

    if (!player) {
      const created = await createPlayer(message, client);
      if (created.error) return message.reply(created.error);
      player = created.player;
    } else {
      const voiceErr = validateVoiceControl(message, player);
      if (voiceErr) return message.reply(voiceErr);
    }

    player.__is247 = !player.__is247;

    if (player.__is247) {
      clearPlayerTimeouts(player);
    }

    await message.reply(
      player.__is247
        ? "🌙 Mode **24/7 diaktifkan**! Bot akan tetap berada di voice channel."
        : "☀️ Mode **24/7 dimatikan**! Bot akan keluar otomatis jika channel kosong atau antrean habis."
    );
  },
};
