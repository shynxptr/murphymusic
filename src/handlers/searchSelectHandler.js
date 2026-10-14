import { SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";

// Handle the search select menu interaction
export async function handleSearchSelect(interaction, client) {
  if (interaction.customId !== "search-select") return;

  const data = client.searchResults?.get(interaction.user.id + interaction.guildId);
  if (!data) {
    return interaction.update({ content: "❌ Data pencarian kedaluwarsa!", components: [] });
  }

  const selectedTrack = data.tracks.find(t => t.encoded === interaction.values[0]);
  if (!selectedTrack) {
    return interaction.update({ content: "❌ Lagu tidak ditemukan!", components: [] });
  }

  const player = client.lavalink.getPlayer(data.guildId);
  if (!player) {
    return interaction.update({ content: "❌ Player tidak ditemukan! Gunakan /play lagi.", components: [] });
  }

  player.queue.add(selectedTrack);

  if (!player.playing && !player.paused) {
    await player.play({ track: selectedTrack });
  }

  const position = player.queue.size;
  const positionText = position > 0 ? `\n📊 Position: #${position}` : "";

  await interaction.update({
    content: `🎵 **${selectedTrack.title}** by **${selectedTrack.author}**${positionText}`,
    components: [],
  });

  // Clean up
  client.searchResults.delete(interaction.user.id + interaction.guildId);
}
