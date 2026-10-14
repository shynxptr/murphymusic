import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the music volume (0-150)")
    .addIntegerOption(option =>
      option
        .setName("level")
        .setDescription("Volume level 0-150")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(150)
    ),

  async execute(interaction, client) {
    const player = client.lavalink.getPlayer(interaction.guildId);
    if (!player) {
      return interaction.reply({ content: "❌ Bot tidak sedang play!", ephemeral: true });
    }

    const level = interaction.options.getInteger("level");
    await player.setVolume(level);

    await interaction.reply(`🔊 Volume diset ke **${level}%**`);
  },
};
