#!/bin/bash

# Backup Script for Razz Card Game
# This script creates backups of the database and application data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/home/ubuntu/backups/razz-game"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="razz-backup-$DATE.tar.gz"

echo -e "${BLUE}💾 Razz Card Game Backup Script${NC}"
echo "===================================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo -e "${BLUE}📦 Creating backup...${NC}"

# Create temporary directory for backup
TEMP_DIR="/tmp/razz-backup-$DATE"
mkdir -p $TEMP_DIR

# Check if application is running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Application is running, creating live backup${NC}"
    
    # Backup database
    echo -e "${YELLOW}📊 Backing up database...${NC}"
    docker-compose -f docker-compose.prod.yml exec -T backend cp prod.db /tmp/backup.db
    docker cp $(docker-compose -f docker-compose.prod.yml ps -q backend):/tmp/backup.db $TEMP_DIR/
    
    # Backup application data
    echo -e "${YELLOW}📁 Backing up application data...${NC}"
    docker-compose -f docker-compose.prod.yml exec -T backend tar -czf /tmp/app-data.tar.gz -C /app/data .
    docker cp $(docker-compose -f docker-compose.prod.yml ps -q backend):/tmp/app-data.tar.gz $TEMP_DIR/
    
else
    echo -e "${YELLOW}⚠️  Application is not running, creating static backup${NC}"
    
    # Backup from volume if available
    if [ -d "backend/data" ]; then
        cp -r backend/data $TEMP_DIR/
    fi
    
    # Backup database file if it exists
    if [ -f "backend/prod.db" ]; then
        cp backend/prod.db $TEMP_DIR/
    fi
fi

# Backup configuration files
echo -e "${YELLOW}⚙️  Backing up configuration files...${NC}"
cp -r backend/.env $TEMP_DIR/ 2>/dev/null || true
cp -r frontend/.env.local $TEMP_DIR/ 2>/dev/null || true
cp docker-compose.prod.yml $TEMP_DIR/
cp -r nginx/ $TEMP_DIR/ 2>/dev/null || true

# Backup systemd service file
sudo cp /etc/systemd/system/razz-game.service $TEMP_DIR/ 2>/dev/null || true

# Create backup archive
echo -e "${YELLOW}📦 Creating backup archive...${NC}"
cd $TEMP_DIR
tar -czf $BACKUP_DIR/$BACKUP_FILE *
cd - > /dev/null

# Clean up temporary directory
rm -rf $TEMP_DIR

# Get backup size
BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)

echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo -e "${BLUE}📊 Backup Details:${NC}"
echo -e "   File: $BACKUP_FILE"
echo -e "   Size: $BACKUP_SIZE"
echo -e "   Location: $BACKUP_DIR/$BACKUP_FILE"

# Clean up old backups (keep last 7 days)
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
find $BACKUP_DIR -name "razz-backup-*.tar.gz" -mtime +7 -delete

# List current backups
echo -e "${BLUE}📋 Current backups:${NC}"
ls -lh $BACKUP_DIR/razz-backup-*.tar.gz 2>/dev/null || echo "No backups found"

echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo "===================================="
echo -e "${BLUE}💡 To restore from backup:${NC}"
echo -e "   ./scripts/restore.sh $BACKUP_FILE"
echo ""
echo -e "${BLUE}📅 To set up automatic backups:${NC}"
echo -e "   Add to crontab: 0 2 * * * /home/ubuntu/razz/scripts/backup.sh"
echo -e "   Edit crontab: crontab -e"
