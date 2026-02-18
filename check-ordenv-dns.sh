#!/bin/bash
# Quick DNS check script for ordenv.org

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_IP=$(hostname -I | awk '{print $1}')

echo "=========================================="
echo "DNS Check for ordenv.org"
echo "=========================================="
echo ""
echo "Server IP: $SERVER_IP"
echo ""

ORDENV_IP=$(dig +short ordenv.org @8.8.8.8 | tail -1)
WWW_ORDENV_IP=$(dig +short www.ordenv.org @8.8.8.8 | tail -1)

echo "Current DNS records:"
echo "  ordenv.org     → $ORDENV_IP"
echo "  www.ordenv.org → $WWW_ORDENV_IP"
echo ""

if [ "$ORDENV_IP" = "$SERVER_IP" ] && [ "$WWW_ORDENV_IP" = "$SERVER_IP" ]; then
    echo -e "${GREEN}✓ DNS is correctly configured!${NC}"
    echo ""
    echo "You can now run:"
    echo "  sudo /var/www/ordenv.org/setup-ordenv-org-ssl.sh"
    exit 0
else
    echo -e "${YELLOW}⚠ DNS not updated yet${NC}"
    echo ""
    echo "Required DNS changes at Namecheap:"
    echo "  A Record: @   → $SERVER_IP"
    echo "  A Record: www → $SERVER_IP"
    echo ""
    echo "Current propagation status:"

    if [ "$ORDENV_IP" = "$SERVER_IP" ]; then
        echo -e "  ordenv.org:     ${GREEN}✓ Correct${NC}"
    else
        echo -e "  ordenv.org:     ${RED}✗ Points to $ORDENV_IP${NC}"
    fi

    if [ "$WWW_ORDENV_IP" = "$SERVER_IP" ]; then
        echo -e "  www.ordenv.org: ${GREEN}✓ Correct${NC}"
    else
        echo -e "  www.ordenv.org: ${RED}✗ Points to $WWW_ORDENV_IP${NC}"
    fi

    echo ""
    echo "DNS propagation can take 10-30 minutes."
    echo "Run this script again to check status."
    exit 1
fi
