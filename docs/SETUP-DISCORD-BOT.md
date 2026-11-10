# 🤖 Setup Discord Bot — Panduan Lengkap

Panduan persiapan bot di Discord Developer Portal hingga menjalankan bot di VPS.

---

## Tahap 1: Konfigurasi di Discord Developer Portal

1. Buka [Discord Developer Portal](https://discord.com/developers/applications) dan pilih aplikasi bot kamu.
2. Buka menu **Bot**:
   - Salin **Token** (klik *Reset Token* jika belum menyimpannya) untuk diisi ke `DISCORD_TOKEN` di `.env`.
   - Scroll ke bagian **Privileged Gateway Intents** dan aktifkan:
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent** *(Wajib untuk membaca prefix `f!`)*
   - Klik **Save Changes**.

---

## Tahap 2: Invite Bot ke Server Discord

Gunakan URL berikut (ganti `CLIENT_ID_KAMU` dengan Application ID bot kamu):

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID_KAMU&permissions=36700160&scope=bot
```

---

## Tahap 3: Konfigurasi `.env` & Menjalankan di VPS

1. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Isi `.env`:
   ```env
   DISCORD_TOKEN=paste_token_bot_disini
   CLIENT_ID=paste_application_id_disini

   LAVALINK_HOST=127.0.0.1
   LAVALINK_PORT=2333
   LAVALINK_PASSWORD=youshallnotpass
   LAVALINK_SECURE=false

   PREFIX=f!
   ```
3. Install dependencies & jalankan:
   ```bash
   npm install
   npm start
   ```

---

## Tahap 4: Contoh Penggunaan Command di Discord

- `f!p lofi hip hop` — Memutar lagu langsung
- `f!search nadin amizah` — Mencari lagu dan memilih nomor `1`–`10`
- `f!q` — Melihat antrean lagu
- `f!s` — Melewati lagu
- `f!v 80` — Mengatur volume ke 80%
- `f!l` — Mengganti mode loop (`off` -> `track` -> `queue`)
- `f!dc` — Menghentikan musik dan keluar dari voice channel
- `f!prefix !` — Mengganti prefix di server tersebut menjadi `!`
- `f!help` — Menampilkan semua command beserta singkatannya
