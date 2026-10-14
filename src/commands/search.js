import { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import { createPlayer, getSourceEmoji, formatDuration, getTrackInfo } from "../utils/musicUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for a song on YouTube and pick from results")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("Song name to search")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const query = interaction.options.getString("query");
    await interaction.deferReply();

    try {
      const tempPlayer = await createPlayer(interaction, client);
      if (tempPlayer.error) {
        return interaction.editReply(tempPlayer.error);
      }
      const player = tempPlayer.player;

      const result = await player.search({
        query,
        source: "ytsearch",
      }, interaction.user);

      if (!result || !result.tracks || result.tracks.length === 0) {
        return interaction.editReply("❌ Tidak ada hasil ditemukan!");
      }

      const tracks = result.tracks.slice(0, 10);
      const options = tracks.map((track, i) => {
        const info = getTrackInfo(track);
        return {
          label: `${i + 1}. ${info.title}`.slice(0, 100),
          description: `${info.author} • ${formatDuration(info.duration)}`.slice(0, 100),
          value: track.encoded,
          emoji: getSourceEmoji(info.sourceName),
        };
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("search-select")
        .setPlaceholder("Pilih lagu yang mau diputar...")
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({
        content: `🔎 Hasil pencarian untuk: **${query}**`,
        components: [row],
      });

      client.searchResults = client.searchResults || new Map();
      client.searchResults.set(interaction.user.id + interaction.guildId, {
        tracks,
        guildId: player.guildId,
      });
    } catch (error) {
      console.error("Search command error:", error);
      await interaction.editReply("❌ Error: " + error.message);
    }
  },
};
