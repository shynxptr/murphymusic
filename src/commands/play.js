import { SlashCommandBuilder } from "discord.js";
import { createPlayer, getSourceEmoji, formatDuration } from "../utils/musicUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube, Spotify, SoundCloud, or any URL")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("Song name, URL, or playlist link")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const { player, error } = await createPlayer(interaction, client);
    if (error) return interaction.reply({ content: error, ephemeral: true });

    const query = interaction.options.getString("query");
    await interaction.deferReply();

    try {
      const result = await player.search({
        query,
        source: "ytsearch",
      }, interaction.user);

      if (!result || result.tracks.length === 0) {
        return interaction.editReply("❌ Tidak ada lagu yang ditemukan!");
      }

      const addedTracks = [];
      let isPlaylist = result.loadType === "playlist";

      if (isPlaylist) {
        for (const track of result.tracks) {
          player.queue.add(track);
          addedTracks.push(track);
        }
      } else {
        const track = result.tracks[0];
        player.queue.add(track);
        addedTracks.push(track);
      }

      const track = addedTracks[0];
      const emoji = getSourceEmoji(track.sourceName);

      if (!player.playing && !player.paused) {
        await player.play({ track: addedTracks[0] });
      }

      if (isPlaylist) {
        await interaction.editReply(
          `🎶 **Playlist added!** ${addedTracks.length} tracks in queue\n` +
          `Now playing: ${emoji} **${track.title}** by **${track.author}**\n` +
          `Duration: ${formatDuration(track.duration)}`
        );
      } else {
        const position = player.queue.size;
        const positionText = position > 0
          ? `\n📊 Position in queue: #${position}`
          : "";

        await interaction.editReply(
          `${emoji} **${track.title}** by **${track.author}**\n` +
          `Duration: ${formatDuration(track.duration)}${positionText}`
        );
      }
    } catch (error) {
      console.error("Play command error:", error);
      await interaction.editReply("❌ Error saat memutar lagu: " + error.message);
    }
  },
};
