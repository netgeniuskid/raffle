#!/bin/bash

# VPS Deployment Script for Razz Card Game
# This script sets up the application on a VPS with nginx and SSL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
API_DOMAIN=""
ADMIN_EMAIL=""
ADMIN_KEY=""

echo -e "${BLUE}🚀 Razz Card Game VPS Deployment Script${NC}"
echo "================================================"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root. Please run as a regular user with sudo privileges.${NC}"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
    echo -e "${YELLOW}⚠️  Please logout and login again to apply Docker group changes, then run this script again.${NC}"
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing nginx...${NC}"
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}✅ nginx installed successfully${NC}"
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ certbot installed successfully${NC}"
fi

# Get configuration from user
echo -e "${BLUE}📋 Configuration Setup${NC}"
echo "======================="

read -p "Enter your domain name (e.g., razz.yourdomain.com): " DOMAIN
read -p "Enter your API domain (e.g., api.yourdomain.com) or press Enter for subdomain: " API_DOMAIN
read -p "Enter your email for SSL certificate: " ADMIN_EMAIL

# Set default API domain if not provided
if [ -z "$API_DOMAIN" ]; then
    API_DOMAIN="api.$DOMAIN"
fi

# Generate secure admin key
ADMIN_KEY=$(openssl rand -base64 16)

echo -e "${BLUE}🔧 Creating environment files...${NC}"

# Create backend environment file
cat > backend/.env << EOF
DATABASE_URL="file:./prod.db"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="30m"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://$DOMAIN"
ADMIN_KEY="$ADMIN_KEY"
EOF

# Create frontend environment file
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL="https://$API_DOMAIN"
NEXT_PUBLIC_ADMIN_KEY="$ADMIN_KEY"
EOF

echo -e "${GREEN}✅ Environment files created${NC}"

echo -e "${BLUE}🐳 Building and starting Docker containers...${NC}"

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Check if services are running
echo -e "${BLUE}🔍 Checking service health...${NC}"

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo -e "${BLUE}🌐 Configuring nginx...${NC}"

# Create nginx configuration
sudo tee /etc/nginx/sites-available/razz-game > /dev/null << EOF
# Frontend (Next.js)
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name $API_DOMAIN;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/razz-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✅ nginx configured successfully${NC}"

echo -e "${BLUE}🔒 Setting up SSL certificate...${NC}"

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d $API_DOMAIN --email $ADMIN_EMAIL --agree-tos --non-interactive

echo -e "${GREEN}✅ SSL certificate configured${NC}"

echo -e "${BLUE}🛠️ Setting up auto-start service...${NC}"

# Create systemd service
sudo tee /etc/systemd/system/razz-game.service > /dev/null << EOF
[Unit]
Description=Razz Card Game
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable razz-game.service
sudo systemctl start razz-game.service

echo -e "${GREEN}✅ Auto-start service configured${NC}"

echo -e "${BLUE}🔧 Setting up firewall...${NC}"

# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo -e "${GREEN}✅ Firewall configured${NC}"

echo -e "${BLUE}📊 Final health check...${NC}"

# Final health check
sleep 5

if curl -f https://$DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend accessible via HTTPS${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend not yet accessible via HTTPS (may take a few minutes)${NC}"
fi

if curl -f https://$API_DOMAIN/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API accessible via HTTPS${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API not yet accessible via HTTPS (may take a few minutes)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "================================================"
echo -e "${BLUE}🌐 Your application is now available at:${NC}"
echo -e "   Frontend: https://$DOMAIN"
echo -e "   Backend API: https://$API_DOMAIN"
echo -e "   Health Check: https://$API_DOMAIN/health"
echo ""
echo -e "${BLUE}🔑 Admin Configuration:${NC}"
echo -e "   Admin Key: $ADMIN_KEY"
echo -e "   (Save this key securely!)"
echo ""
echo -e "${BLUE}🛠️ Management Commands:${NC}"
echo -e "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "   Restart: docker-compose -f docker-compose.prod.yml restart"
echo -e "   Stop: docker-compose -f docker-compose.prod.yml down"
echo -e "   Update: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "   1. Update your DNS records to point to this server"
echo -e "   2. Test the application thoroughly"
echo -e "   3. Set up regular backups"
echo -e "   4. Monitor server resources"
echo ""
echo -e "${GREEN}✨ Enjoy your Razz Card Game!${NC}"
