import "dotenv/config";
import { LavalinkManager } from "lavalink-client";
import { clearPlayerTimeouts, getTrackInfo, hasPlayableTracks } from "./utils/musicUtils.js";
import { getPrefix } from "./utils/prefixManager.js";

// Need access to client for shard sending - imported dynamically to avoid circular dependency
let client = null;
export function setClient(c) {
  client = c;
}

// Lavalink manager - handles all audio playback (local node 127.0.0.1:2333 by default)
export const manager = new LavalinkManager({
  nodes: [
    {
      id: "main-node",
      host: process.env.LAVALINK_HOST || "127.0.0.1",
      port: parseInt(process.env.LAVALINK_PORT || "2333", 10),
      authorization: process.env.LAVALINK_PASSWORD || "youshallnotpass",
      secure: process.env.LAVALINK_SECURE === "true",
      retryAmount: 5,
      retryDelay: 5000,
      autoChecks: {
        sourcesValidations: false,
        pluginValidations: false,
      },
    },
  ],
  // Send audio data to Discord voice gateway
  sendToShard: (guildId, payload) => {
    const guild = client?.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  // Auto skip on track error/end
  autoSkip: true,
  // Queue options
  queueOptions: {
    maxPreviousTracks: 100,
  },
  // Player options
  playerOptions: {
    defaultVolume: 100,
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: false,
    },
  },
});

// Attach node.rest.resolve(searchString) helper to all nodes for direct Lavalink v4 /loadtracks resolution
function attachRestResolve(node) {
  if (!node) return;
  if (!node.rest) {
    node.rest = {
      resolve: async (identifier) => {
        return await node.request(`/loadtracks?identifier=${encodeURIComponent(identifier)}`);
      },
    };
  }
}

for (const node of manager.nodeManager.nodes.values()) {
  attachRestResolve(node);
}

// Node Manager Event Listeners (prevent unhandled error crashes)
manager.nodeManager.on("connect", (node) => {
  attachRestResolve(node);
  console.log(`🟢 Lavalink node "${node.id}" connected (${node.options.host}:${node.options.port})!`);
});

manager.nodeManager.on("reconnecting", (node) => {
  console.log(`🟡 Lavalink node "${node.id}" reconnecting...`);
});

manager.nodeManager.on("disconnect", (node, reason) => {
  console.warn(`🟠 Lavalink node "${node.id}" disconnected:`, reason);
});

manager.nodeManager.on("error", (node, error) => {
  console.error(`🔴 Lavalink node "${node.id}" error:`, error.message || error);
});

// Player Event Listeners
manager.on("trackStart", (player) => {
  clearPlayerTimeouts(player);
});

manager.on("trackError", async (player, track, payload) => {
  const info = getTrackInfo(track);
  console.error(`Track error in guild ${player.guildId} for "${info.title}":`, payload?.exception || payload);

  // If a YouTube track failed to stream (e.g. AllClientsFailedException), auto-fallback to SoundCloud
  if (info.sourceName?.toLowerCase().includes("youtube") && !track?.__scFallbackTried) {
    try {
      const searchQuery = `${info.author !== "Unknown" ? info.author + " " : ""}${info.title}`.trim();
      const res = player.node?.rest?.resolve
        ? await player.node.rest.resolve(`scsearch:${searchQuery}`)
        : await player.node.request(`/loadtracks?identifier=${encodeURIComponent(`scsearch:${searchQuery}`)}`);

      if (hasPlayableTracks(res)) {
        const rawFallback = Array.isArray(res.data) ? res.data[0] : res.data;
        const fallbackTrack = player.LavalinkManager?.utils?.buildTrack
          ? player.LavalinkManager.utils.buildTrack(rawFallback, track?.requester)
          : { ...rawFallback, requester: track?.requester };

        fallbackTrack.__scFallbackTried = true;
        console.log(`[Fallback] Playing SoundCloud mirror for "${info.title}"`);
        await player.queue.add(fallbackTrack, 0);
        await player.play();
        return;
      }
    } catch (fallbackErr) {
      console.error("[Fallback] SoundCloud fallback failed:", fallbackErr.message);
    }
  }

  const channel = client?.channels.cache.get(player.textChannelId);
  if (channel) {
    channel.send(`⚠️ Gagal memutar **${info.title}** — melewati ke lagu berikutnya.`).catch(() => {});
  }
});

manager.on("trackStuck", (player, track, payload) => {
  const info = getTrackInfo(track);
  console.warn(`Track stuck in guild ${player.guildId} for "${info.title}" (${payload?.thresholdMs}ms)`);
  player.skip(0, false).catch(() => {});
});

manager.on("queueEnd", (player) => {
  const prefix = getPrefix(player.guildId);
  const channel = client?.channels.cache.get(player.textChannelId);
  if (channel) {
    channel.send(`📭 Antrean lagu sudah habis! Ketik \`${prefix}p <judul>\` untuk memutar lagu lagi.`).catch(() => {});
  }

  if (!player.__is247 && !player.__queueEndTimeout) {
    player.__queueEndTimeout = setTimeout(() => {
      const p = manager.getPlayer(player.guildId);
      if (p && !p.playing && !p.paused && !p.__is247) {
        clearPlayerTimeouts(p);
        p.destroy().catch(() => {});
      }
    }, 5 * 60 * 1000);
  }
});

manager.on("playerDestroy", (player) => {
  clearPlayerTimeouts(player);
});
