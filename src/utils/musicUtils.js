import prettyMs from "pretty-ms";

/**
 * Format duration from milliseconds to readable string
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return "0:00";
  if (ms < 3600000) {
    // Under 1 hour: show M:SS
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }
  return prettyMs(ms, { colonNotation: true, secondsDecimalDigits: 0 });
}

/**
 * Create a progress bar for the current track
 */
export function createProgressBar(position, duration, size = 15) {
  if (!duration) return "🔴 LIVE";
  const pct = position / duration;
  const filled = Math.round(size * pct);
  const empty = size - filled;
  return `${"█".repeat(filled)}${"░".repeat(empty)} ${Math.round(pct * 100)}%`;
}

/**
 * Get track source icon/emoji
 */
export function getSourceEmoji(sourceName) {
  const map = {
    youtube: "🔴",
    youtube_music: "🔴",
    spotify: "🟢",
    soundcloud: "🟠",
    apple: "🍎",
    deezer: "🔵",
    http: "🔗",
    local: "📁",
  };
  return map[sourceName?.toLowerCase()] || "🎵";
}

/**
 * Ensure member is in a voice channel
 */
export function getVoiceChannel(interaction) {
  const member = interaction.guild.members.cache.get(interaction.user.id);
  return member?.voice?.channel;
}

/**
 * Ensure member is in the same voice channel as bot
 */
export function isSameVoiceChannel(interaction, player) {
  const memberVoice = getVoiceChannel(interaction);
  if (!memberVoice) return false;
  if (memberVoice.id !== player.voiceChannelId) return false;
  return true;
}

/**
 * Create player if it doesn't exist yet
 */
export async function createPlayer(interaction, client) {
  const voiceChannel = getVoiceChannel(interaction);
  if (!voiceChannel) {
    return {
      error: "❌ Kamu harus berada di voice channel dulu!",
    };
  }

  const permissions = voiceChannel.permissionsFor(client.user);
  if (!permissions?.has("Connect") || !permissions?.has("Speak")) {
    return {
      error: "❌ Aku tidak punya izin untuk connect atau speak di voice channel ini!",
    };
  }

  let player = client.lavalink.getPlayer(interaction.guildId);

  if (!player) {
    player = await client.lavalink.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      selfMute: false,
    });

    // Connect to voice channel
    await player.connect();
  } else if (player.voiceChannelId !== voiceChannel.id) {
    // Move to new voice channel
    await player.setVoiceChannelId(voiceChannel.id);
  }

  return { player };
}
