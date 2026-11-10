import { formatDuration, getTrackInfo, validateVoiceControl } from "../utils/musicUtils.js";

/**
 * Parse time input like "90", "1:30", or "01:02:30" into milliseconds
 */
function parseTimeToMs(input) {
  if (!input) return null;
  const parts = input.split(":").map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 1) {
    return parts[0] * 1000;
  } else if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  } else if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return null;
}

export default {
  name: "seek",
  aliases: ["sk", "jump"],
  description: "Lompat ke durasi waktu tertentu pada lagu (contoh: 1:30 atau 90)",
  usage: "<menit:detik | detik>",

  async execute(message, args, client, prefix) {
    const player = client.lavalink.getPlayer(message.guild.id);
    if (!player || !player.queue.current) {
      return message.reply("❌ Tidak ada lagu yang sedang diputar!");
    }

    const voiceErr = validateVoiceControl(message, player);
    if (voiceErr) return message.reply(voiceErr);

    if (!args.length) {
      return message.reply(`❌ Masukkan waktu tujuan! Contoh: \`${prefix}seek 1:30\` atau \`${prefix}seek 90\``);
    }

    const info = getTrackInfo(player.queue.current);
    if (!info.duration) {
      return message.reply("❌ Lagu live stream tidak bisa di-seek!");
    }

    const targetMs = parseTimeToMs(args[0]);
    if (targetMs === null || targetMs < 0 || targetMs > info.duration) {
      return message.reply(
        `❌ Waktu tidak valid! Masukkan waktu antara \`0:00\` sampai \`${formatDuration(info.duration)}\`.`
      );
    }

    await player.seek(targetMs);
    await message.reply(`⏩ Melompat ke posisi **\`${formatDuration(targetMs)}\` / \`${formatDuration(info.duration)}\`**`);
  },
};
