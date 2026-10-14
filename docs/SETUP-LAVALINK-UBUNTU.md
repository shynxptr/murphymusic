# 🖥️ Setup Lavalink di Tencent Cloud (Ubuntu)

Panduan lengkap deploy Lavalink server di Tencent Cloud VM Ubuntu untuk bot music Discord kamu.

---

## 📋 Prasyarat

- **Tencent Cloud VM** dengan Ubuntu 20.04/22.04/24.04
- Akses SSH ke server (root atau sudo user)
- Security Group Tencent Cloud sudah allow port **2333** (TCP)

---

## 🚀 Cara Cepat (1 Command)

Aku sudah bikin script otomatis. Tinggal upload ke server dan jalankan:

### Step 1: Upload script ke server

```bash
# Dari komputer lokal kamu
scp setup-lavalink.sh root@YOUR_SERVER_IP:/root/
```

Atau kalau mau download langsung di server (kalau sudah di-push ke git):

```bash
# SSH ke server
ssh root@YOUR_SERVER_IP
```

### Step 2: Jalankan script

```bash
sudo bash setup-lavalink.sh
```

Script ini akan otomatis:
1. Update sistem Ubuntu
2. Install Java 17
3. Download Lavalink v4
4. Generate password random
5. Buat config `application.yml`
6. Buat systemd service (auto-start & auto-restart)
7. Buka port firewall 2333
8. Start Lavalink

Setelah selesai, script akan print **Host**, **Port**, dan **Password** yang kamu butuhkan untuk `.env` bot.

---

## 🔧 Manual Setup (Step by Step)

Kalau mau setup manual, ikuti langkah-langkah berikut.

### Step 1: SSH ke Server Tencent Cloud

```bash
ssh root@YOUR_SERVER_IP
```

Contoh:
```bash
ssh root@43.135.108.25
```

### Step 2: Update Sistem

```bash
apt update && apt upgrade -y
apt install -y curl wget unzip screen ufw
```

### Step 3: Install Java 17

Lavalink v4 butuh Java 17+ minimum.

```bash
apt install -y openjdk-17-jre-headless

# Verifikasi
java -version
# Output harus: openjdk version "17.x.x"
```

> **Note:** Kalau mau pakai Java 21 (lebih baru), bisa install:
> ```bash
> apt install -y openjdk-21-jre-headless
> ```

### Step 4: Buat User & Directory Lavalink

Best practice: jalanin Lavalink sebagai user terpisah (bukan root).

```bash
# Buat system user untuk lavalink
useradd -r -s /bin/false lavalink

# Buat directory
mkdir -p /opt/lavalink
```

### Step 5: Download Lavalink

```bash
cd /opt/lavalink

# Download Lavalink v4 (cek versi terbaru di GitHub releases)
wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar -O Lavalink.jar

# Set permission
chown -R lavalink:lavalink /opt/lavalink
```

Cek versi terbaru di: https://github.com/lavalink-devs/Lavalink/releases

### Step 6: Buat Config `application.yml`

```bash
nano /opt/lavalink/application.yml
```

Paste config berikut:

```yaml
server:
  port: 2333
  address: 0.0.0.0  # Listen di semua interface

lavalink:
  server:
    password: "GANTI_DENGAN_PASSWORD_KAMU"  # GANTI INI!
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      vimeo: true
      http: true
      twitch: true
      local: false

# Plugin untuk Spotify support & SponsorBlock
plugins:
  - dependency: "com.github.topi314.lavasrc:lavasrc-plugin:4.2.0"
    repository: "https://jitpack.io"

lavasrc:
  providers:
    - "ytsearch:\"%ISRC%\""
    - "ytsearch:%QUERY%"
  spotify:
    clientId: "SPOTIFY_CLIENT_ID_KAMU"      # Optional, untuk Spotify
    clientSecret: "SPOTIFY_CLIENT_SECRET_KAMU"
    countryCode: "US"

metrics:
  prometheus:
    enabled: false
    endpoint: /metrics

logging:
  file:
    path: /opt/lavalink/logs
  level:
    root: INFO
    lavalink: INFO
```

Simpan (`Ctrl+X`, `Y`, `Enter`).

Generate password random yang kuat:
```bash
openssl rand -hex 16
# Copy output, paste ke field password di application.yml
```

Set permission:
```bash
chown lavalink:lavalink /opt/lavalink/application.yml
chmod 640 /opt/lavalink/application.yml
```

### Step 7: Buat Systemd Service

Systemd service = auto-start saat boot + auto-restart kalau crash.

```bash
nano /etc/systemd/system/lavalink.service
```

Paste:

```ini
[Unit]
Description=Lavalink Audio Server
After=syslog.target network.target

[Service]
User=lavalink
Group=lavalink
WorkingDirectory=/opt/lavalink
ExecStart=/usr/bin/java -Xmx2G -jar /opt/lavalink/Lavalink.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/lavalink
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Simpan.

> **Note RAM:** `-Xmx2G` = maksimal 2GB RAM. Untuk Tencent Cloud VM kecil:
> - 2GB RAM VM: pakai `-Xmx1G`
> - 4GB RAM VM: pakai `-Xmx2G`
> - 8GB+ RAM VM: pakai `-Xmx4G` atau lebih

### Step 8: Enable & Start Service

```bash
# Reload systemd
systemctl daemon-reload

# Enable auto-start on boot
systemctl enable lavalink

# Start service
systemctl start lavalink

# Cek status
systemctl status lavalink
```

Output harus menampilkan **active (running)**.

### Step 9: Konfigurasi Firewall

#### Ubuntu UFW Firewall:
```bash
ufw allow 22/tcp     # SSH
ufw allow 2333/tcp   # Lavalink
ufw enable
ufw status
```

#### Tencent Cloud Security Group:
Ini **sangat penting**! Security Group Tencent Cloud adalah firewall eksternal yang terpisah dari UFW.

1. Login ke **Tencent Cloud Console** → https://console.cloud.tencent.com
2. Pilih **Cloud Virtual Machine (CVM)**
3. Klik instance VM kamu
4. Buka tab **Security Group**
5. Klik **Configure Rules** → **Inbound Rules**
6. Add rule:
   - **Type:** Custom
   - **Source:** `0.0.0.0/0` (atau IP bot kamu saja untuk keamanan)
   - **Protocol & Port:** TCP:2333
   - **Policy:** Allow
7. Save

> **⚠️ Keamanan:** Untuk production, jangan buka port 2333 ke `0.0.0.0/0`. Batasi hanya ke IP server bot kamu. Contoh: Source = `1.2.3.4/32` (IP bot).

### Step 10: Test Lavalink

```bash
# Dari server (localhost test)
curl -H "Authorization: GANTI_DENGAN_PASSWORD_KAMU" http://localhost:2333/v4/info

# Dari komputer lokal kamu (remote test)
curl -H "Authorization: PASSWORD_KAMU" http://YOUR_SERVER_IP:2333/v4/info
```

Kalau berhasil, akan return JSON dengan info Lavalink:
```json
{
  "version": {"semver": "4.0.8", ...},
  "sourceManagers": ["youtube", "soundcloud", ...]
}
```

### Step 11: Update Bot `.env`

Edit file `.env` di project bot kamu:

```env
LAVALINK_HOST=43.135.108.25     # IP Tencent Cloud VM kamu
LAVALINK_PORT=2333
LAVALINK_PASSWORD=password_yang_digenerate
LAVALINK_SECURE=false
```

---

## 🔒 Security Best Practices

### 1. Batasi Akses IP (Paling Penting!)

Di Security Group Tencent Cloud, jangan pakai `0.0.0.0/0`. Hanya allow IP server bot:

```
Source: IP_BOT_SERVER/32
Port: TCP 2333
```

### 2. Pakai Password yang Kuat

```bash
# Generate password 32 karakter
openssl rand -hex 32
```

Update di `application.yml` dan `.env` bot.

### 3. Pakai HTTPS (SSL/TLS) — Optional tapi Recommended

Pakai reverse proxy Nginx + Let's Encrypt:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

Buat config Nginx:

```bash
nano /etc/nginx/sites-available/lavalink
```

```nginx
server {
    listen 443 ssl;
    server_name lavalink.domainkamu.com;

    ssl_certificate /etc/letsencrypt/live/lavalink.domainkamu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lavalink.domainkamu.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:2333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name lavalink.domainkamu.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
ln -s /etc/nginx/sites-available/lavalink /etc/nginx/sites-enabled/
certbot --nginx -d lavalink.domainkamu.com
systemctl restart nginx
```

Update `.env` bot:
```env
LAVALINK_HOST=lavalink.domainkamu.com
LAVALINK_PORT=443
LAVALINK_SECURE=true
```

### 4. Tutup Port 2333 di Security Group

Kalau sudah pakai Nginx HTTPS (port 443), tutup port 2333 di Security Group. Lavalink hanya listen di localhost.

Update `application.yml`:
```yaml
server:
  port: 2333
  address: 127.0.0.1  # Hanya localhost!
```

---

## 📊 Monitoring & Maintenance

### Cek Status
```bash
systemctl status lavalink
```

### Lihat Logs
```bash
# Live logs
journalctl -u lavalink -f

# Last 100 lines
journalctl -u lavalink -n 100

# Logs sejak 1 jam lalu
journalctl -u lavalink --since "1 hour ago"
```

### Restart Lavalink
```bash
systemctl restart lavalink
```

### Update Lavalink ke Versi Baru
```bash
systemctl stop lavalink

# Backup old version
cp /opt/lavalink/Lavalink.jar /opt/lavalink/Lavalink.jar.bak

# Download new version
cd /opt/lavalink
wget https://github.com/lavalink-devs/Lavalink/releases/download/NEW_VERSION/Lavalink.jar -O Lavalink.jar
chown lavalink:lavalink Lavalink.jar

# Start
systemctl start lavalink
```

### Cek Resource Usage
```bash
# CPU & RAM
top -p $(pgrep -f Lavalink)

# Atau
systemctl status lavalink
```

---

## 🐛 Troubleshooting

### Lavalink tidak start
```bash
# Cek error log
journalctl -u lavalink -n 50 --no-pager
```

**Common errors:**

| Error | Solusi |
|-------|--------|
| `Java not found` | Install Java: `apt install -y openjdk-17-jre-headless` |
| `Permission denied` | `chown -R lavalink:lavalink /opt/lavalink` |
| `Port 2333 in use` | `lsof -i :2333` lalu kill process, atau ganti port |
| `OutOfMemoryError` | Naikkan `-Xmx` di service file, atau upgrade VM RAM |

### Bot tidak bisa connect ke Lavalink
1. **Cek Security Group** — Port 2333 TCP harus allow di inbound
2. **Cek UFW** — `ufw status` pastikan 2333 allow
3. **Cek password** — Password di `.env` bot harus sama dengan `application.yml`
4. **Test dari bot server:**
   ```bash
   curl -H "Authorization: PASSWORD" http://SERVER_IP:2333/v4/info
   ```

### YouTube source tidak berfungsi
YouTube sering berubah API. Pastikan:
1. Pakai Lavalink v4 versi terbaru
2. Plugin `lavasrc-plugin` ter-install (sudah ada di config)
3. Cek log untuk error YouTube

### Lagu bunyi stuttering / lag
- Upgrade RAM VM (minimal 2GB untuk 1-5 server)
- Naikkan `-Xmx` di systemd service
- Gunakan Tencent Cloud VM dengan **CPU Optimized** (turbo boost lebih baik untuk audio decoding)

---

## 💡 Tips Tencent Cloud Spesifik

### Pilih VM yang Tepat

| Jumlah Server Discord | Spec VM | Tencent Cloud Instance |
|----------------------|---------|------------------------|
| 1-10 servers | 2 vCPU, 2GB RAM | S5.MEDIUM4 atau SA2.MEDIUM4 |
| 10-50 servers | 2 vCPU, 4GB RAM | S5.LARGE8 |
| 50-200 servers | 4 vCPU, 8GB RAM | S5.2XLARGE16 |
| 200+ servers | 8 vCPU, 16GB+ | S5.4XLARGE32 atau pakai multiple nodes |

### Region
Pilih region Tencent Cloud terdekat dengan mayoritas user Discord kamu:
- **Singapore** (ap-singapore) — bagus untuk Southeast Asia
- **Tokyo** (ap-tokyo) — bagus untuk Asia Timur
- **Silicon Valley** (na-siliconvalley) — bagus untuk US

### Bandwidth
Tencent Cloud default bandwidth bisa kecil (1-5 Mbps). Untuk Lavalink, bandwidth tidak terlalu kritis karena audio streaming via Discord voice server, bukan via VM kamu. Tapi pastikan minimal **1 Mbps** untuk stability.

### Snapshot
Sebelum update atau konfigurasi, buat snapshot di Tencent Cloud:
1. Console → CVM → Instances
2. Pilih VM → **More** → **Snapshot** → **Create Snapshot**
3. Kalau ada masalah, bisa rollback dari snapshot
