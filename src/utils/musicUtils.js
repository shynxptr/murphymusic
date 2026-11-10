/**
 * Safely get track info fields (lavalink-client stores them in track.info)
 */
export function getTrackInfo(track) {
  const info = track?.info || track || {};
  return {
    title: info.title || "Unknown",
    author: info.author || "Unknown",
    duration: info.duration || track?.duration || 0,
    sourceName: info.sourceName || track?.sourceName || "",
    artworkUrl: info.artworkUrl || track?.artworkUrl || null,
    uri: info.uri || track?.uri || null,
  };
}

/**
 * Format duration from milliseconds to readable string (M:SS or H:MM:SS)
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Create a progress bar for the current track
 */
export function createProgressBar(position, duration, size = 15) {
  if (!duration) return "🔴 LIVE";
  const pct = Math.min(Math.max(position / duration, 0), 1);
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
 * Extract clean song title & artist from YouTube / Spotify URLs via public oEmbed
 * Used as an automatic fallback when Lavalink cannot load a direct YouTube/Spotify URL
 */
export async function resolveUrlFallbackQuery(url) {
  try {
    let oembedUrl = null;
    if (/^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (/^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\//i.test(url)) {
      oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    }

    if (!oembedUrl) return null;

    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.title) return null;

    // Clean common YouTube suffixes like "(Official Music Video)", "[Official Audio]", "(Lyrics)", etc.
    const cleanTitle = data.title
      .replace(/\(official\s*(music\s*)?(video|audio|lyric\s*video|visualizer|mv)\)/gi, "")
      .replace(/\[official\s*(music\s*)?(video|audio|lyric\s*video|visualizer|mv)\]/gi, "")
      .replace(/\((lyrics?|audio|hd|4k|mv)\)/gi, "")
      .replace(/\[(lyrics?|audio|hd|4k|mv)\]/gi, "")
      .trim();

    const author = data.author_name
      ? data.author_name.replace(/\s*-\s*Topic$/i, "").trim()
      : "";

    if (author && !cleanTitle.toLowerCase().includes(author.toLowerCase())) {
      return `${author} - ${cleanTitle}`;
    }
    return cleanTitle;
  } catch {
    return null;
  }
}

/**
 * Ensure member is in a voice channel (works for Message or Interaction)
 */
export function getVoiceChannel(ctx) {
  const userId = ctx.author?.id || ctx.user?.id;
  return (
    ctx.member?.voice?.channel ||
    ctx.guild?.members?.cache.get(userId)?.voice?.channel ||
    null
  );
}

/**
 * Ensure member is in the same voice channel as bot
 */
export function isSameVoiceChannel(ctx, player) {
  const memberVoice = getVoiceChannel(ctx);
  if (!memberVoice || !player?.voiceChannelId) return false;
  return memberVoice.id === player.voiceChannelId;
}

/**
 * Validate that the user is in the same voice channel as the bot for control commands
 */
export function validateVoiceControl(ctx, player) {
  const memberVoice = getVoiceChannel(ctx);
  if (!memberVoice) {
    return "❌ Kamu harus berada di voice channel terlebih dahulu!";
  }
  if (player?.voiceChannelId && memberVoice.id !== player.voiceChannelId) {
    return `❌ Kamu harus berada di voice channel yang sama dengan bot (<#${player.voiceChannelId}>)!`;
  }
  return null;
}

/**
 * Clear custom timeouts attached to a player
 */
export function clearPlayerTimeouts(player) {
  if (!player) return;
  if (player.__leaveTimeout) {
    clearTimeout(player.__leaveTimeout);
    player.__leaveTimeout = null;
  }
  if (player.__queueEndTimeout) {
    clearTimeout(player.__queueEndTimeout);
    player.__queueEndTimeout = null;
  }
}

/**
 * Create player if it doesn't exist yet
 */
export async function createPlayer(ctx, client) {
  const voiceChannel = getVoiceChannel(ctx);
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

  const guildId = ctx.guildId || ctx.guild?.id;
  const channelId = ctx.channelId || ctx.channel?.id;
  let player = client.lavalink.getPlayer(guildId);

  if (!player) {
    player = await client.lavalink.createPlayer({
      guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId: channelId,
      selfDeaf: true,
      selfMute: false,
    });

    // Connect to voice channel
    await player.connect();
  } else if (player.voiceChannelId !== voiceChannel.id) {
    // Only allow moving channel if the old channel has no human listeners or bot is idle
    const oldChannel = ctx.guild?.channels?.cache.get(player.voiceChannelId);
    const humansInOld = oldChannel
      ? oldChannel.members.filter(m => !m.user.bot).size
      : 0;

    if (humansInOld > 0 && (player.playing || player.paused)) {
      return {
        error: `❌ Bot sedang digunakan di <#${player.voiceChannelId}>! Bergabunglah ke sana untuk menambahkan lagu.`,
      };
    }

    player.voiceChannelId = voiceChannel.id;
    player.textChannelId = channelId;
    await player.connect();
  } else {
    player.textChannelId = channelId;
  }

  return { player };
}
