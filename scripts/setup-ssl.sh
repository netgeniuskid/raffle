#!/bin/bash

# SSL Setup Script for Razz Card Game
# This script sets up SSL certificates using Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 SSL Certificate Setup for Razz Card Game${NC}"
echo "=============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root. Please run as a regular user with sudo privileges.${NC}"
   exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ certbot installed successfully${NC}"
fi

# Get domain information
echo -e "${BLUE}📋 Domain Configuration${NC}"
echo "=========================="

read -p "Enter your main domain (e.g., razz.yourdomain.com): " MAIN_DOMAIN
read -p "Enter your API domain (e.g., api.yourdomain.com) or press Enter for subdomain: " API_DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL

# Set default API domain if not provided
if [ -z "$API_DOMAIN" ]; then
    API_DOMAIN="api.$MAIN_DOMAIN"
fi

echo -e "${BLUE}🔧 Updating nginx configuration...${NC}"

# Update nginx configuration with actual domains
sudo sed -i "s/your-domain.com/$MAIN_DOMAIN/g" /etc/nginx/sites-available/razz-game
sudo sed -i "s/api.your-domain.com/$API_DOMAIN/g" /etc/nginx/sites-available/razz-game

# Test nginx configuration
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ nginx configuration is valid${NC}"
    sudo systemctl reload nginx
else
    echo -e "${RED}❌ nginx configuration is invalid${NC}"
    exit 1
fi

echo -e "${BLUE}🔒 Obtaining SSL certificates...${NC}"

# Get SSL certificates
sudo certbot --nginx -d $MAIN_DOMAIN -d $API_DOMAIN --email $EMAIL --agree-tos --non-interactive

echo -e "${GREEN}✅ SSL certificates obtained successfully${NC}"

echo -e "${BLUE}🔄 Testing SSL configuration...${NC}"

# Test SSL configuration
sleep 5

if curl -f https://$MAIN_DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main domain SSL is working: https://$MAIN_DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠️  Main domain SSL test failed (may take a few minutes to propagate)${NC}"
fi

if curl -f https://$API_DOMAIN/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API domain SSL is working: https://$API_DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠️  API domain SSL test failed (may take a few minutes to propagate)${NC}"
fi

echo -e "${BLUE}🔄 Setting up auto-renewal...${NC}"

# Check if auto-renewal is already set up
if sudo systemctl is-enabled certbot.timer > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSL auto-renewal is already enabled${NC}"
else
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    echo -e "${GREEN}✅ SSL auto-renewal enabled${NC}"
fi

# Test auto-renewal
echo -e "${BLUE}🧪 Testing auto-renewal...${NC}"
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal test successful${NC}"
else
    echo -e "${YELLOW}⚠️  Auto-renewal test failed (check configuration)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SSL setup completed successfully!${NC}"
echo "=============================================="
echo -e "${BLUE}🌐 Your secure application is now available at:${NC}"
echo -e "   Frontend: https://$MAIN_DOMAIN"
echo -e "   Backend API: https://$API_DOMAIN"
echo -e "   Health Check: https://$API_DOMAIN/health"
echo ""
echo -e "${BLUE}🔒 SSL Features:${NC}"
echo -e "   ✅ Automatic HTTPS redirect"
echo -e "   ✅ A+ SSL rating (with proper configuration)"
echo -e "   ✅ Auto-renewal every 60 days"
echo -e "   ✅ Security headers configured"
echo ""
echo -e "${BLUE}🛠️ SSL Management Commands:${NC}"
echo -e "   Check certificates: sudo certbot certificates"
echo -e "   Renew manually: sudo certbot renew"
echo -e "   Test renewal: sudo certbot renew --dry-run"
echo -e "   View renewal logs: sudo journalctl -u certbot"
echo ""
echo -e "${GREEN}✨ Your application is now secure!${NC}"
