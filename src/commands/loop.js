import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode for the queue")
    .addStringOption(option =>
      option
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Track - loop current song", value: "track" },
          { name: "Queue - loop entire queue", value: "queue" },
        )
    ),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ content: "❌ Bot tidak sedang play!", ephemeral: true });
    }

    const mode = interaction.options.getString("mode");

    switch (mode) {
      case "off":
        await player.setRepeatMode("off");
        await interaction.reply("🔁 Loop **dimatikan**");
        break;
      case "track":
        await player.setRepeatMode("track");
        await interaction.reply(`🔂 Loop **track** diaktifkan: **${player.queue.current?.title}**`);
        break;
      case "queue":
        await player.setRepeatMode("queue");
        await interaction.reply("🔁 Loop **queue** diaktifkan! Semua lagu akan diulang.");
        break;
    }
  },
};
