# 🎵 Discord Music Bot (Jockie Music Clone)

Bot music Discord dengan fitur lengkap, terinspirasi dari **Jockie Music** — salah satu bot music Discord terbesar. Mendukung multi-server, YouTube, Spotify, SoundCloud, playlist, dan lebih banyak lagi.

## ✨ Fitur

| Command | Deskripsi |
|---------|-----------|
| `/play <query/url>` | Play lagu dari YouTube/Spotify/SoundCloud/URL |
| `/search <query>` | Cari lagu di YouTube, pilih dari dropdown |
| `/queue` | Lihat queue lagu yang akan diputar |
| `/nowplaying` | Lihat lagu yang sedang diputar dengan progress bar |
| `/skip` | Skip lagu yang sedang diputar |
| `/stop` | Stop bot & clear queue, disconnect dari voice |
| `/pause` | Pause lagu |
| `/resume` | Resume lagu yang di-pause |
| `/volume <0-150>` | Set volume music |
| `/loop <off/track/queue>` | Set loop mode |
| `/shuffle` | Acak urutan queue |
| `/remove <position>` | Hapus lagu dari queue berdasarkan posisi |

### Fitur Tambahan (mirip Jockie Music)
- ✅ **Auto-leave** ketika tidak ada orang di voice channel (5 menit)
- ✅ **Auto-resume** setelah bot restart
- ✅ **Playlist support** — play seluruh playlist sekaligus
- ✅ **Multi-source** — YouTube, Spotify, SoundCloud, dan lainnya
- ✅ **Progress bar** real-time
- ✅ **Track history** — menyimpan 100 lagu sebelumnya
- ✅ **Queue management** — shuffle, remove, loop

## 📋 Prasyarat

1. **Node.js v18+** — [Download](https://nodejs.org/)
2. **Java 17+** — Diperlukan untuk menjalankan Lavalink server
3. **Lavalink v4** — Download dari [GitHub Releases](https://github.com/lavalink-devs/Lavalink/releases)

## 🚀 Setup

### 1. Buat Discord Bot
1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik **New Application** → kasih nama
3. Buka tab **Bot** → copy token
4. Enable **Message Content Intent**, **Server Members Intent**, dan **Voice State Intent** di tab Bot
5. Copy **Application ID** (Client ID) dari tab **General Information**

### 2. Setup Lavalink
1. Download `Lavalink.jar` dari [releases page](https://github.com/lavalink-devs/Lavalink/releases)
2. Buat file `application.yml` di folder yang sama dengan jar:

```yaml
server:
  port: 2333

lavalink:
  server:
    password: yournamelavalink
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      vimeo: true
      http: true
      twitch: true
      local: false

plugins:
  - dependency: "com.github.topi314.lavasrc:lavasrc-plugin:4.2.0"
    repository: "https://jitpack.io"

lavasrc:
  providers:
    - "ytsearch:\"%ISRC%\""
    - "ytsearch:%QUERY%"
  spotify:
    clientId: ""
    clientSecret: ""
    countryCode: "US"
```

3. Jalankan Lavalink:
```bash
java -jar Lavalink.jar
```

### 3. Setup Bot

```bash
# Install dependencies
npm install

# Copy config
cp .env.example .env

# Edit .env dengan token dan credential kamu
# DISCORD_TOKEN=your_bot_token
# CLIENT_ID=your_client_id
# LAVALINK_PASSWORD=yournamelavalink

# Deploy slash commands ke Discord
npm run deploy

# Jalankan bot!
npm start
```

### 4. Invite Bot ke Server
Buka URL ini di browser (ganti `CLIENT_ID`):

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=36700160&scope=bot%20applications.commands
```

**Permissions: 36700160** = Connect, Speak, Send Messages, Read Message History, Use Voice Activity

## 🏗️ Struktur Project

```
discord-music-bot/
├── src/
│   ├── commands/           # Slash commands
│   │   ├── play.js
│   │   ├── search.js
│   │   ├── queue.js
│   │   ├── nowplaying.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   ├── pause.js
│   │   ├── resume.js
│   │   ├── volume.js
│   │   ├── loop.js
│   │   ├── shuffle.js
│   │   └── remove.js
│   ├── events/
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── voiceStateUpdate.js
│   │   └── raw.js
│   ├── handlers/
│   │   ├── commandHandler.js
│   │   ├── eventHandler.js
│   │   └── searchSelectHandler.js
│   ├── utils/
│   │   └── musicUtils.js
│   ├── lavalink.js
│   ├── index.js
│   └── deploy-commands.js
├── .env.example
├── .gitignore
└── package.json
```

## 🔧 Konfigurasi Lanjutan

### Spotify Support
1. Buka [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Buat app → copy Client ID & Client Secret
3. Isi di `.env`:
```
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
```
Dan di `application.yml` Lavalink, isi `clientId` & `clientSecret` di section `spotify`.

### Multiple Lavalink Nodes (Load Balancing)
Edit `src/lavalink.js` dan tambahkan node tambahan di array `nodes`. Berguna untuk scaling ke banyak server seperti Jockie Music.

## 📝 Referensi & Inspirasi

- **Jockie Music** — Bot music Discord dengan 20+ juta server. Mendukung multi-channel playback, 12+ source platform, filters audio, dan auto-resume.
- **Lavalink** — Audio node server yang handle playback. Dibuat untuk performance tinggi dengan Java.
- **lavalink-client** — Modern Node.js wrapper untuk Lavalink v4 dengan built-in Spotify support, auto-resume, dan multi-node load balancing.

## 🚀 Tips Scaling (untuk jadi seperti Jockie Music)

1. **Multiple Lavalink nodes** — Distribusi load antar server
2. **Sharding** — Gunakan Discord.js sharding untuk >2000 servers
3. **Database** — Simpan player state ke Redis/PostgreSQL untuk auto-resume yang robust
4. **Web Dashboard** — Buat web dashboard untuk kontrol queue
5. **Audio Filters** — Tambahkan bassboost, nightcore, vaporwave, dll
6. **DJ System** — Role-based permission untuk skip/stop

## 📄 License

MIT — Bebas pakai dan modifikasi.
