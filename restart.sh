#!/bin/bash
set -e

APP_DIR="/var/www/ordenv.org"
PM2_NAME="ordenv"
PM2_USER="deploy"
PM2_HOME="/home/deploy/.pm2"

echo "==> Building $PM2_NAME..."
cd "$APP_DIR"
npm run build

echo "==> Restarting PM2 process: $PM2_NAME..."
sudo -u "$PM2_USER" PM2_HOME="$PM2_HOME" pm2 restart "$PM2_NAME" --update-env

echo "==> Waiting for process to stabilize..."
sleep 5

sudo -u "$PM2_USER" PM2_HOME="$PM2_HOME" pm2 show "$PM2_NAME" | grep -E "(status|restarts|uptime)"
echo "==> Done."
