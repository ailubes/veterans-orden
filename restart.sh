#!/bin/bash
set -e

APP_DIR="/var/www/ordenv.org"
PM2_NAME="ordenv"

echo "==> Building $PM2_NAME..."
cd "$APP_DIR"
npm run build

echo "==> Stopping secondary PM2 instance if running on port 3031..."
PM2_HOME=/tmp/.pm2 pm2 stop ordenv 2>/dev/null || true

echo "==> Clearing port 3031 if occupied by orphan processes..."
fuser -k 3031/tcp 2>/dev/null || true
sleep 1

echo "==> Restarting PM2 process: $PM2_NAME..."
pm2 restart "$PM2_NAME" --update-env

echo "==> Waiting for process to stabilize..."
sleep 5

pm2 show "$PM2_NAME" | grep -E "(status|restarts|uptime)"
echo "==> Done."
