import { clearPlayerTimeouts } from "../utils/musicUtils.js";

// Auto-cleanup: when bot is alone in voice channel, disconnect after delay
const LEAVE_DELAY = 5 * 60 * 1000; // 5 minutes

export default {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    const guild = newState.guild || oldState.guild;

    // Get player for this guild
    const player = client.lavalink.getPlayer(guild.id);
    if (!player) return;

    // Check if bot itself disconnected
    if (oldState.member?.id === client.user.id && !newState.channelId) {
      clearPlayerTimeouts(player);
      await player.destroy().catch(() => {});
      return;
    }

    // Check if bot is in a voice channel
    const voiceChannelId = player.voiceChannelId;
    if (!voiceChannelId) return;

    // Get the voice channel
    const voiceChannel = guild.channels.cache.get(voiceChannelId);
    if (!voiceChannel) return;

    // Count non-bot members
    const humans = voiceChannel.members.filter(m => !m.user.bot);

    if (humans.size === 0) {
      if (player.__is247) return;
      // Auto-leave after delay (Jockie-like behavior)
      if (!player.__leaveTimeout) {
        player.__leaveTimeout = setTimeout(() => {
          const p = client.lavalink.getPlayer(guild.id);
          if (p && !p.__is247) {
            clearPlayerTimeouts(p);
            const channel = client.channels.cache.get(p.textChannelId);
            if (channel) {
              channel.send("👋 Keluar dari voice channel karena tidak ada pendengar selama 5 menit.").catch(() => {});
            }
            p.destroy().catch(() => {});
            console.log(`Auto-left empty voice channel in ${guild.name}`);
          }
        }, LEAVE_DELAY);
      }
    } else {
      // Cancel leave timeout if someone re-joined
      if (player.__leaveTimeout) {
        clearTimeout(player.__leaveTimeout);
        player.__leaveTimeout = null;
      }
    }
  },
};
