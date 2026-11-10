export default {
  name: "help",
  aliases: ["h", "commands"],
  description: "Tampilkan daftar semua command dan singkatannya",
  usage: "",

  async execute(message, args, client, prefix) {
    const lines = [];

    for (const [, cmd] of client.commands) {
      const aliasStr = cmd.aliases?.length
        ? ` (singkatan: ${cmd.aliases.map(a => `\`${prefix}${a}\``).join(", ")})`
        : "";
      const usageStr = cmd.usage ? ` \`${cmd.usage}\`` : "";
      lines.push(`• **\`${prefix}${cmd.name}\`**${usageStr}${aliasStr}\n  └ ${cmd.description || "-"}`);
    }

    const embed = {
      color: 0x2b2d31,
      title: "🎵 Daftar Command Music Bot",
      description:
        `Prefix server ini: **\`${prefix}\`** (bisa disingkat misal \`${prefix}p <lagu>\`)\n\n` +
        lines.join("\n"),
      footer: {
        text: `Tip: Mention @${client.user.username} kapan saja jika lupa prefix server ini.`,
      },
    };

    await message.reply({ embeds: [embed] });
  },
};

