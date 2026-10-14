# 🤖 Setup Discord Bot — Panduan Lengkap

Panduan step-by-step dari buat bot di Discord Developer Portal sampai bot online dan bisa dipakai.

---

## Tahap 1: Buat Bot di Discord Developer Portal

### 1.1 Buat Application

1. Buka **Discord Developer Portal**: https://discord.com/developers/applications
2. Klik tombol **New Application** (pojok kanan atas)
3. Kasih nama bot kamu, contoh: **Murphy Music**
4. Centang checkbox terms → klik **Create**

### 1.2 Ambil Client ID

1. Buka tab **General Information** (menu kiri)
2. Scroll ke bawah, cari **Application ID**
3. Copy angkanya — ini adalah `CLIENT_ID` kamu

Contoh: `1234567890123456789`

### 1.3 Ambil Bot Token

1. Buka tab **Bot** (menu kiri)
2. Klik **Reset Token** → klik **Yes, do it!**
3. Discord akan menampilkan token (hanya muncul sekali!)
4. **COPY TOKEN INI** dan simpan di tempat aman

Contoh format token: `YOUR_BOT_TOKEN_HERE` (string panjang dari Discord)

> ⚠️ **JANGAN share token ini ke siapapun!** Siapapun yang punya token ini bisa kontrol bot kamu.

### 1.4 Enable Intents (WAJIB)

Masih di tab **Bot**, scroll ke bawah ke section **Privileged Gateway Intents**:

Toggle ON ketiga opsi berikut:
- ✅ **Presence Intent**
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

> Tanpa intents ini, bot tidak bisa baca pesan, deteksi member, dan fungsi voice akan bermasalah.

Klik **Save Changes** di bawah.

### 1.5 Set Bot Username & Avatar (Optional)

Masih di tab **Bot**:
- **Username**: Murphy Music (atau nama bot kamu)
- **Avatar**: Upload gambar icon bot
- Klik **Save Changes**

---

## Tahap 2: Isi `.env` File

Buka file `.env` di project folder dan isi:

```env
# Discord Bot Configuration
DISCORD_TOKEN=paste_token_dari_step_1.3_disini                            # Token dari Step 1.3
CLIENT_ID=paste_application_id_dari_step_1.2_disini                        # Application ID dari Step 1.2

# Lavalink node configuration (sudah diisi dari Tencent Cloud)
LAVALINK_HOST=43.128.232.65
LAVALINK_PORT=2333
LAVALINK_PASSWORD=4a706e93892f4d63764a446037e86614
LAVALINK_SECURE=false

# Optional: Spotify (kosongkan dulu kalau belum punya)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

PREFIX=!
```

Ganti `DISCORD_TOKEN` dan `CLIENT_ID` dengan punyamu.

---

## Tahap 3: Deploy Slash Commands

Langkah ini mendaftarkan 12 slash commands (`/play`, `/skip`, dll) ke Discord agar muncul di server.

```bash
cd c:/Users/Admin/CodeBuddy/20261014180134
npm run deploy
```

Output kalau sukses:
```
Deploying 12 slash commands...
✅ Successfully deployed 12 slash commands!

Commands:
  /play - Play a song from YouTube, Spotify, SoundCloud, or any URL
  /search - Search for a song on YouTube and pick from results
  /queue - Show the current music queue
  /nowplaying - Show the currently playing song
  /skip - Skip the current song
  /stop - Stop playing and clear the queue
  /pause - Pause the current song
  /resume - Resume the paused song
  /volume - Set the music volume (0-150)
  /loop - Set loop mode for the queue
  /shuffle - Shuffle the current queue
  /remove - Remove a song from the queue by position
```

> **Note:** Deploy cukup dilakukan sekali. Ulangi hanya kalau kamu menambah/mengubah command.

---

## Tahap 4: Invite Bot ke Server Discord

Bot harus di-invite ke server Discord kamu dulu.

### 4.1 Buat Invite Link

Pakai URL berikut, ganti `CLIENT_ID` dengan punyamu:

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID_KAMU&permissions=36700160&scope=bot%20applications.commands
```

Contoh:
```
https://discord.com/api/oauth2/authorize?client_id=1234567890123456789&permissions=36700160&scope=bot%20applications.commands
```

### 4.2 Authorize Bot

1. Buka link di browser
2. Pilih server Discord kamu dari dropdown
3. Klik **Authorize**
4. Selesaikan captcha
5. Bot akan muncul di member list server kamu

**Permissions yang diminta (36700160):**
- ✅ Connect (connect ke voice channel)
- ✅ Speak (stream audio)
- ✅ Send Messages
- ✅ Read Message History
- ✅ Use Voice Activity

---

## Tahap 5: Start Bot

```bash
cd c:/Users/Admin/CodeBuddy/20261014180134
npm start
```

Output kalau sukses:
```
✅ Loaded command: play
✅ Loaded command: search
✅ Loaded command: queue
...
✅ Loaded event: ready
✅ Loaded event: interactionCreate
✅ Loaded event: voiceStateUpdate
✅ Loaded event: raw

🎵 Murphy Music#1234 is online!
📊 Serving 1 guilds
```

Bot akan menampilkan status **Listening to 🎵 Music** di Discord.

---

## Tahap 6: Test Bot

### Test /play
1. Masuk voice channel di server Discord kamu
2. Ketik `/play` di text channel
3. Pilih `query` field, isi: `lofi hip hop`
4. Bot akan masuk voice channel dan mulai play
5. Lagu akan mulai diputar

### Test command lain
- `/nowplaying` — lihat info lagu yang sedang diputar
- `/queue` — lihat queue
- `/skip` — skip ke lagu berikutnya
- `/volume 50` — set volume ke 50%
- `/loop queue` — loop semua lagu
- `/pause` → `/resume` — pause dan resume
- `/stop` — stop dan disconnect

---

## 🚨 Troubleshooting

### Bot tidak online setelah `npm start`

| Error | Solusi |
|-------|--------|
| `Invalid token` | Cek `DISCORD_TOKEN` di `.env`, pastikan tidak ada spasi |
| `Missing Access` | Bot belum di-invite ke server, lakukan Tahap 4 |
| `Cannot find module` | Jalankan `npm install` dulu |
| `connect ECONNREFUSED 43.128.232.65:2333` | Lavalink server mati, cek di server: `systemctl status lavalink` |

### Slash commands tidak muncul

1. Pastikan `npm run deploy` sukses tanpa error
2. Tunggu 1-5 menit (Discord cache global)
3. Restart Discord client (Ctrl+R)
4. Coba ketik `/play` di text channel — harus ada autocomplete
5. Kalau bot role tidak punya permission "Use Application Commands", aktifkan di Server Settings → Roles

### Bot masuk voice tapi tidak ada suara

1. Cek bot role punya permission **Speak** di voice channel
2. Cek Lavalink server: `systemctl status lavalink` (harus active)
3. Cek log bot untuk error
4. Pastikan kamu berada di voice channel yang sama dengan bot

### Error "Privileged intent(s) are not enabled"

Kamu belum enable intents di Developer Portal:
1. Buka Developer Portal → Bot
2. Toggle ON: Presence, Server Members, Message Content
3. Save Changes
4. Restart bot

### Lavalink connection error

```bash
# Test dari komputer kamu
Invoke-RestMethod -Uri "http://43.128.232.65:2333/v4/info" -Headers @{ Authorization = "4a706e93892f4d63764a446037e86614" }
```

Kalau timeout:
- Cek Security Group Tencent Cloud — port 2333 TCP harus open
- Cek Lavalink running: `systemctl status lavalink`
- Restart Lavalink: `systemctl restart lavalink`

---

## ✅ Checklist Final

- [ ] Application dibuat di Discord Developer Portal
- [ ] `DISCORD_TOKEN` diisi di `.env`
- [ ] `CLIENT_ID` diisi di `.env`
- [ ] Intents di-enable (Presence, Members, Message Content)
- [ ] `npm install` sudah dijalankan
- [ ] `npm run deploy` sukses (12 commands terdaftar)
- [ ] Bot di-invite ke server Discord
- [ ] `npm start` — bot online
- [ ] Test `/play` — music mulai diputar di voice channel
