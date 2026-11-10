import { getPrefix, setPrefix, resetPrefix, DEFAULT_PREFIX } from "../utils/prefixManager.js";

export default {
  name: "prefix",
  aliases: ["setprefix"],
  description: "Lihat atau ubah prefix command bot di server ini",
  usage: "[prefix_baru | reset]",

  async execute(message, args) {
    const currentPrefix = getPrefix(message.guild.id);

    if (!args.length) {
      return message.reply(
        `📌 Prefix saat ini di server **${message.guild.name}** adalah \`${currentPrefix}\`\n` +
        `Ketik \`${currentPrefix}prefix <prefix_baru>\` untuk mengganti, atau \`${currentPrefix}prefix reset\` untuk kembali ke default (\`${DEFAULT_PREFIX}\`).`
      );
    }

    const newPrefix = args[0].trim();

    if (newPrefix.toLowerCase() === "reset") {
      resetPrefix(message.guild.id);
      return message.reply(`✅ Prefix berhasil direset kembali ke default: \`${DEFAULT_PREFIX}\``);
    }

    if (newPrefix.length > 5) {
      return message.reply("❌ Prefix maksimal 5 karakter!");
    }

    setPrefix(message.guild.id, newPrefix);
    await message.reply(
      `✅ Prefix server ini berhasil diubah menjadi \`${newPrefix}\`\n` +
      `Sekarang kamu bisa menggunakan command seperti \`${newPrefix}p <judul lagu>\` atau \`${newPrefix}help\`.`
    );
  },
};

