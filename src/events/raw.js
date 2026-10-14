// Forward raw Discord gateway payloads to Lavalink
// lavalink-client's sendRawData() internally filters for VOICE_STATE_UPDATE
// and VOICE_SERVER_UPDATE, so we just pass everything through
export default {
  name: "raw",
  async execute(payload, client) {
    if (!client.lavalink) return;
    client.lavalink.sendRawData(payload);
  },
};
