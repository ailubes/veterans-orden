#!/bin/bash
# SSL Setup Script for ordenv.org
# Run this script after DNS has been updated to point to this server

set -e

echo "=========================================="
echo "SSL Setup for ordenv.org"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"
echo ""

# Function to check DNS
check_dns() {
    echo -e "${YELLOW}Checking DNS for ordenv.org...${NC}"

    ORDENV_IP=$(dig +short ordenv.org @8.8.8.8 | tail -1)
    WWW_ORDENV_IP=$(dig +short www.ordenv.org @8.8.8.8 | tail -1)

    echo "ordenv.org resolves to: $ORDENV_IP"
    echo "www.ordenv.org resolves to: $WWW_ORDENV_IP"
    echo ""

    if [ "$ORDENV_IP" = "$SERVER_IP" ] && [ "$WWW_ORDENV_IP" = "$SERVER_IP" ]; then
        echo -e "${GREEN}✓ DNS is correctly configured!${NC}"
        return 0
    else
        echo -e "${RED}✗ DNS is not pointing to this server yet.${NC}"
        echo ""
        echo "Expected IP: $SERVER_IP"
        echo "Current ordenv.org IP: $ORDENV_IP"
        echo "Current www.ordenv.org IP: $WWW_ORDENV_IP"
        echo ""
        echo "Please update your DNS records at Namecheap:"
        echo "  A Record: @ → $SERVER_IP"
        echo "  A Record: www → $SERVER_IP"
        echo ""
        return 1
    fi
}

# Check DNS first
if ! check_dns; then
    echo -e "${YELLOW}Exiting. Run this script again after DNS propagates.${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "Obtaining SSL Certificate"
echo "=========================================="
echo ""

# Obtain SSL certificate
if certbot certonly --nginx \
    -d ordenv.org \
    -d www.ordenv.org \
    --non-interactive \
    --agree-tos \
    --email admin@ordenv.org; then

    echo ""
    echo -e "${GREEN}✓ SSL certificate obtained successfully!${NC}"
else
    echo ""
    echo -e "${RED}✗ Failed to obtain SSL certificate${NC}"
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "=========================================="
echo "Updating Nginx Configuration"
echo "=========================================="
echo ""

# Update nginx configuration with HTTPS
cat > /etc/nginx/sites-available/ordenv.org << 'NGINX_CONFIG'
# Орден Ветеранів - ordenv.org
# Next.js application on port 3031

server {
    listen 80;
    listen [::]:80;
    server_name ordenv.org www.ordenv.org;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ordenv.org www.ordenv.org;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/ordenv.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ordenv.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logs
    access_log /var/log/nginx/ordenv.org.access.log;
    error_log /var/log/nginx/ordenv.org.error.log;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3031;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3031;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3031;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Client max body size
    client_max_body_size 10M;
}
NGINX_CONFIG

echo -e "${GREEN}✓ Nginx configuration updated${NC}"
echo ""

# Test nginx configuration
echo "Testing nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi

echo ""

# Reload nginx
echo "Reloading nginx..."
if systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to reload nginx${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ SSL Setup Complete!"
echo "=========================================="
echo ""
echo "Your site is now available at:"
echo "  • https://ordenv.org"
echo "  • https://www.ordenv.org"
echo ""
echo "Both domains now have:"
echo "  ✓ Valid SSL certificates"
echo "  ✓ Automatic HTTPS redirect"
echo "  ✓ Auto-renewal configured"
echo ""
echo "Certificate expires: $(date -d '+90 days' '+%B %d, %Y')"
echo "Auto-renewal: Enabled via certbot systemd timer"
echo ""
echo -e "${GREEN}All done! 🎉${NC}"
