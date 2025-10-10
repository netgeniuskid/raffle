#!/bin/bash

# Firebase VPS Deployment Script for Razz Card Game
# This script deploys the Firebase version to your VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Razz Card Game Firebase VPS Deployment${NC}"
echo "=============================================="

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

# Get configuration from user
echo -e "${BLUE}📋 Configuration Setup${NC}"
echo "======================="

read -p "Enter your domain name (e.g., razz.yourdomain.com): " DOMAIN
read -p "Enter your email for SSL certificate: " ADMIN_EMAIL

# Generate secure admin key
ADMIN_KEY=$(openssl rand -base64 16)

echo -e "${BLUE}🔥 Firebase Configuration${NC}"
echo "=========================="
echo "You can find these values in your Firebase project settings:"
echo "Project Settings > General > Your apps > Web app config"
echo ""

read -p "Enter Firebase API Key: " FIREBASE_API_KEY
read -p "Enter Firebase Auth Domain: " FIREBASE_AUTH_DOMAIN
read -p "Enter Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Enter Firebase Storage Bucket: " FIREBASE_STORAGE_BUCKET
read -p "Enter Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Enter Firebase App ID: " FIREBASE_APP_ID

echo -e "${BLUE}🔧 Creating environment files...${NC}"

# Create frontend environment file
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL="https://$DOMAIN"
NEXT_PUBLIC_ADMIN_KEY="$ADMIN_KEY"
NEXT_PUBLIC_FIREBASE_API_KEY="$FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="$FIREBASE_APP_ID"
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

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo -e "${BLUE}🌐 Configuring nginx...${NC}"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing nginx...${NC}"
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}✅ nginx installed successfully${NC}"
fi

# Create nginx configuration
sudo tee /etc/nginx/sites-available/razz-game << EOF
# Frontend (Next.js with Firebase)
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
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/razz-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✅ nginx configured successfully${NC}"

echo -e "${BLUE}🔒 Setting up SSL certificate...${NC}"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing certbot...${NC}"
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ certbot installed successfully${NC}"
fi

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN --email $ADMIN_EMAIL --agree-tos --non-interactive

echo -e "${GREEN}✅ SSL certificate configured${NC}"

echo -e "${BLUE}🛠️ Setting up auto-start service...${NC}"

# Create systemd service
sudo tee /etc/systemd/system/razz-game.service << EOF
[Unit]
Description=Razz Card Game (Firebase)
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

echo ""
echo -e "${GREEN}🎉 Firebase VPS Deployment completed successfully!${NC}"
echo "=============================================="
echo -e "${BLUE}🌐 Your application is now available at:${NC}"
echo -e "   Frontend: https://$DOMAIN"
echo -e "   Firebase Backend: Connected to Firebase Firestore"
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
echo -e "${GREEN}✨ Enjoy your Razz Card Game with Firebase!${NC}"
