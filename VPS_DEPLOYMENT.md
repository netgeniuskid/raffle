# VPS Deployment Guide for Razz Card Game

This guide covers deploying the Razz Card Game on your cloud VPS server with nginx reverse proxy and SSL.

## 🖥️ VPS Requirements

- **OS**: Ubuntu 20.04+ or CentOS 8+ (recommended: Ubuntu 22.04)
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 20GB+ free space
- **CPU**: 2+ cores
- **Network**: Public IP with ports 80, 443, and optionally 22 (SSH)

## 🚀 Quick Deployment

### Step 1: Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Logout and login again to apply docker group changes
```

### Step 2: Deploy the Application

```bash
# Clone your repository
git clone <your-repo-url>
cd razz

# Make deployment script executable
chmod +x deploy-vps.sh

# Run deployment script
./deploy-vps.sh
```

### Step 3: Configure Domain and SSL

```bash
# Set up SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Or if using subdomain
sudo certbot --nginx -d razz.your-domain.com
```

## 🔧 Manual Setup (Alternative)

If you prefer manual setup or need custom configuration:

### 1. Environment Configuration

Create production environment files:

```bash
# Backend environment
cat > backend/.env << EOF
DATABASE_URL="file:./prod.db"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="30m"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
ADMIN_KEY="$(openssl rand -base64 16)"
EOF

# Frontend environment
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
NEXT_PUBLIC_ADMIN_KEY="your-admin-key"
EOF
```

### 2. Deploy with Docker

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3. Configure Nginx

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/razz-game
```

Add the following configuration:

```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/razz-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Configuration

### Option 1: Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal (already configured)
sudo systemctl status certbot.timer
```

### Option 2: Custom SSL Certificate

```bash
# Place your certificates in /etc/ssl/certs/
sudo cp your-cert.pem /etc/ssl/certs/
sudo cp your-key.pem /etc/ssl/private/

# Update nginx configuration with SSL settings
```

## 🛠️ Management Commands

### Application Management

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Management

```bash
# Access database
docker-compose -f docker-compose.prod.yml exec backend npx prisma studio

# Backup database
docker-compose -f docker-compose.prod.yml exec backend cp prod.db /app/data/backup-$(date +%Y%m%d).db

# Restore database
docker-compose -f docker-compose.prod.yml exec backend cp /app/data/backup-20240101.db prod.db
```

### System Management

```bash
# Check service status
sudo systemctl status nginx
docker-compose -f docker-compose.prod.yml ps

# View system resources
htop
df -h
docker system df

# Clean up Docker
docker system prune -a
```

## 🔧 Advanced Configuration

### Auto-Start on Boot

Create systemd service:

```bash
sudo nano /etc/systemd/system/razz-game.service
```

Add:

```ini
[Unit]
Description=Razz Card Game
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/razz
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
```

Enable service:

```bash
sudo systemctl enable razz-game.service
sudo systemctl start razz-game.service
```

### Monitoring and Logs

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Set up log rotation
sudo nano /etc/logrotate.d/razz-game
```

Add:

```
/home/ubuntu/razz/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :3001
   ```

2. **Docker permission issues:**
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

3. **SSL certificate issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Database issues:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
   ```

### Logs and Debugging

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u razz-game
```

## 📊 Performance Optimization

### Nginx Optimization

```nginx
# Add to nginx configuration
client_max_body_size 10M;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Docker Optimization

```bash
# Limit container resources
# Add to docker-compose.prod.yml:
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## 🔐 Security Hardening

1. **Update system regularly:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure fail2ban:**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

3. **Set up automatic backups:**
   ```bash
   # Create backup script
   nano backup.sh
   chmod +x backup.sh
   crontab -e
   # Add: 0 2 * * * /home/ubuntu/razz/backup.sh
   ```

## 📈 Scaling Considerations

For high traffic:

1. **Use a load balancer** (HAProxy, nginx)
2. **Separate database** (PostgreSQL with connection pooling)
3. **CDN** for static assets
4. **Redis** for session management
5. **Multiple app instances** behind load balancer

Your VPS deployment is now ready! The application will be accessible at your domain with full SSL encryption.
