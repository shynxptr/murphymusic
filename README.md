# 🎵 Murphy Music Bot

Bot musik Discord berbasis **Lavalink v4** dan **discord.js v14** dengan sistem **Prefix Command** (default: `f!`) dan singkatan command cepat ala Jockie Music (`f!p`, `f!s`, `f!q`, dll).

## ✨ Daftar Command & Singkatan

Default prefix adalah **`f!`** (bisa diubah per server menggunakan `f!prefix <prefix_baru>`).

| Command | Singkatan (Aliases) | Deskripsi |
|---------|---------------------|-----------|
| `f!play <judul/URL>` | `f!p` | Putar lagu atau playlist dari YouTube, Spotify, SoundCloud, atau URL |
| `f!search <judul>` | `f!find`, `f!sc` | Cari lagu di YouTube dan pilih dengan ketik angka `1`–`10` di chat |
| `f!queue [halaman]` | `f!q`, `f!list` | Tampilkan antrean lagu yang sedang berjalan |
| `f!nowplaying` | `f!np`, `f!current` | Tampilkan detail lagu yang sedang diputar beserta progress bar |
| `f!skip` | `f!s`, `f!next` | Lewati lagu yang sedang diputar |
| `f!previous` | `f!prev`, `f!back`, `f!b` | Putar kembali lagu sebelumnya |
| `f!pause` | `f!pa` | Jeda lagu yang sedang diputar |
| `f!resume` | `f!r`, `f!unpause` | Lanjutkan lagu yang dijeda |
| `f!seek <waktu>` | `f!sk`, `f!jump` | Lompat ke durasi tertentu (contoh: `f!seek 1:30` atau `f!seek 90`) |
| `f!stop` | `f!dc`, `f!leave` | Hentikan musik, bersihkan antrean, dan keluar dari voice channel |
| `f!volume [0-150]` | `f!v`, `f!vol` | Cek atau ubah volume musik (0–150%) |
| `f!loop [off\|track\|queue]` | `f!l`, `f!repeat` | Atur mode pengulangan lagu atau antrean |
| `f!shuffle` | `f!sh`, `f!mix` | Acak urutan lagu di antrean |
| `f!remove <nomor>` | `f!rm`, `f!delete` | Hapus lagu dari antrean berdasarkan nomor urut |
| `f!clear` | `f!cl`, `f!empty` | Bersihkan seluruh antrean tanpa menghentikan lagu yang sedang jalan |
| `f!247` | `f!stay`, `f!24/7` | Aktifkan/matikan mode 24/7 di voice channel |
| `f!prefix [prefix\|reset]` | `f!setprefix` | Lihat atau ubah prefix command khusus untuk server tersebut |
| `f!help` | `f!h`, `f!commands` | Tampilkan daftar semua command dan singkatannya |

## 🚀 Cara Menjalankan di VPS

Pastikan server **Lavalink** sudah berjalan di host yang sama (`127.0.0.1:2333`, password `youshallnotpass`).

```bash
# 1. Install dependencies
npm install

# 2. Salin konfigurasi environment
cp .env.example .env

# 3. Isi DISCORD_TOKEN di file .env
nano .env

# 4. Jalankan bot
npm start
```

### Konfigurasi `.env`

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

PREFIX=f!
```

> **Penting:** Pastikan **Message Content Intent** dan **Server Members Intent** sudah diaktifkan di [Discord Developer Portal](https://discord.com/developers/applications) pada menu **Bot**.
