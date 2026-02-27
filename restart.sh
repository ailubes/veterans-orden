#!/bin/bash
set -e

APP_DIR="/var/www/ordenv.org"
PM2_NAME="ordenv"

echo "==> Building $PM2_NAME..."
cd "$APP_DIR"
npm run build

echo "==> Clearing port 3031 if occupied by orphan processes..."
fuser -k 3031/tcp 2>/dev/null || true

echo "==> Restarting PM2 process: $PM2_NAME..."
PM2_HOME=/tmp/.pm2 pm2 restart "$PM2_NAME"

echo "==> Waiting for process to stabilize..."
sleep 3

PM2_HOME=/tmp/.pm2 pm2 show "$PM2_NAME" | grep -E "(status|restarts|uptime)"
echo "==> Done."
