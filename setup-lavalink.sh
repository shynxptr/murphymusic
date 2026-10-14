#!/bin/bash
# ============================================================
# Lavalink Setup Script for Ubuntu (Tencent Cloud)
# Run as root or with sudo
# Usage: sudo bash setup-lavalink.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   Lavalink Setup - Ubuntu Server      ${NC}"
echo -e "${CYAN}   Optimized for Tencent Cloud          ${NC}"
echo -e "${CYAN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo bash setup-lavalink.sh${NC}"
  exit 1
fi

# ==========================================
# 1. Update System
# ==========================================
echo -e "\n${YELLOW}[1/6] Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl wget unzip screen ufw

# ==========================================
# 2. Install Java 17 (Lavalink v4 requirement)
# ==========================================
echo -e "\n${YELLOW}[2/6] Installing Java 17...${NC}"
apt install -y openjdk-17-jre-headless
java -version

# ==========================================
# 3. Create Lavalink user & directory
# ==========================================
echo -e "\n${YELLOW}[3/6] Creating Lavalink directory...${NC}"
useradd -r -s /bin/false lavalink 2>/dev/null || true
mkdir -p /opt/lavalink
cd /opt/lavalink

# ==========================================
# 4. Download Lavalink v4
# ==========================================
echo -e "\n${YELLOW}[4/6] Downloading Lavalink v4...${NC}"

LAVALINK_VERSION="4.0.8"
if [ ! -f /opt/lavalink/Lavalink.jar ] || [ ! -s /opt/lavalink/Lavalink.jar ]; then
  wget -q "https://github.com/lavalink-devs/Lavalink/releases/download/${LAVALINK_VERSION}/Lavalink.jar" -O /opt/lavalink/Lavalink.jar
  echo -e "${GREEN}Downloaded Lavalink v${LAVALINK_VERSION}${NC}"
else
  echo -e "${GREEN}Lavalink.jar already exists, skipping download${NC}"
fi

chown -R lavalink:lavalink /opt/lavalink

# ==========================================
# 5. Generate config
# ==========================================
echo -e "\n${YELLOW}[5/6] Generating application.yml...${NC}"

# Generate random password
LAVALINK_PASSWORD=$(openssl rand -hex 16)

cat > /opt/lavalink/application.yml << EOF
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  server:
    password: "${LAVALINK_PASSWORD}"
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
  - dependency: "com.github.topi314.sponsorblock:sponsorblock-plugin:3.2.1"
    repository: "https://jitpack.io"

lavasrc:
  providers:
    - "ytsearch:\\"%ISRC%\\""
    - "ytsearch:%QUERY%"
  spotify:
    clientId: ""
    clientSecret: ""
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
EOF

chown lavalink:lavalink /opt/lavalink/application.yml

echo -e "${GREEN}Config generated!${NC}"
echo -e "${CYAN}Your Lavalink Password: ${LAVALINK_PASSWORD}${NC}"
echo -e "${YELLOW}Save this password! You'll need it in your .env file${NC}"

# ==========================================
# 6. Create systemd service
# ==========================================
echo -e "\n${YELLOW}[6/6] Creating systemd service...${NC}"

cat > /etc/systemd/system/lavalink.service << 'EOF'
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

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/lavalink
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl daemon-reload
systemctl enable lavalink
systemctl start lavalink

# Wait for startup
sleep 3
if systemctl is-active --quiet lavalink; then
  echo -e "\n${GREEN}✅ Lavalink is running!${NC}"
else
  echo -e "\n${RED}❌ Lavalink failed to start. Check logs:${NC}"
  journalctl -u lavalink -n 30
  exit 1
fi

# ==========================================
# Firewall config
# ==========================================
echo -e "\n${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp comment "SSH" 2>/dev/null || true
ufw allow 2333/tcp comment "Lavalink" 2>/dev/null || true
echo -e "${GREEN}Firewall: port 2333 opened${NC}"

# ==========================================
# Summary
# ==========================================
SERVER_IP=$(curl -s http://metadata.tencentyun.com/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me)

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}   ✅ Lavalink Setup Complete!          ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Lavalink Server Info:${NC}"
echo -e "  Host:     ${SERVER_IP}"
echo -e "  Port:     2333"
echo -e "  Password: ${LAVALINK_PASSWORD}"
echo -e "  URL:      http://${SERVER_IP}:2333"
echo ""
echo -e "${YELLOW}Update your bot's .env file:${NC}"
echo -e "  LAVALINK_HOST=${SERVER_IP}"
echo -e "  LAVALINK_PORT=2333"
echo -e "  LAVALINK_PASSWORD=${LAVALINK_PASSWORD}"
echo -e "  LAVALINK_SECURE=false"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  Status:   systemctl status lavalink"
echo -e "  Stop:     systemctl stop lavalink"
echo -e "  Restart:  systemctl restart lavalink"
echo -e "  Logs:     journalctl -u lavalink -f"
echo ""
echo -e "${YELLOW}Config file: /opt/lavalink/application.yml${NC}"
echo ""
