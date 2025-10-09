#!/bin/bash

# Restore Script for Razz Card Game
# This script restores the application from a backup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/home/ubuntu/backups/razz-game"

echo -e "${BLUE}🔄 Razz Card Game Restore Script${NC}"
echo "===================================="

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Please provide a backup file name${NC}"
    echo -e "${BLUE}Usage: $0 <backup-file-name>${NC}"
    echo ""
    echo -e "${BLUE}Available backups:${NC}"
    ls -la $BACKUP_DIR/razz-backup-*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Check if backup file exists
if [ ! -f "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_PATH${NC}"
    echo -e "${BLUE}Available backups:${NC}"
    ls -la $BACKUP_DIR/razz-backup-*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

echo -e "${BLUE}📦 Restoring from backup: $BACKUP_FILE${NC}"

# Confirm restore
read -p "Are you sure you want to restore from this backup? This will overwrite current data. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 1
fi

# Stop application
echo -e "${YELLOW}🛑 Stopping application...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Create temporary directory for restore
TEMP_DIR="/tmp/razz-restore-$(date +%s)"
mkdir -p $TEMP_DIR

# Extract backup
echo -e "${YELLOW}📦 Extracting backup...${NC}"
cd $TEMP_DIR
tar -xzf $BACKUP_PATH
cd - > /dev/null

# Restore configuration files
echo -e "${YELLOW}⚙️  Restoring configuration files...${NC}"
if [ -f "$TEMP_DIR/.env" ]; then
    cp $TEMP_DIR/.env backend/
    echo -e "${GREEN}✅ Backend configuration restored${NC}"
fi

if [ -f "$TEMP_DIR/.env.local" ]; then
    cp $TEMP_DIR/.env.local frontend/
    echo -e "${GREEN}✅ Frontend configuration restored${NC}"
fi

# Restore database
echo -e "${YELLOW}📊 Restoring database...${NC}"
if [ -f "$TEMP_DIR/backup.db" ]; then
    # Start backend temporarily to restore database
    docker-compose -f docker-compose.prod.yml up -d backend
    sleep 10
    
    # Copy database file
    docker cp $TEMP_DIR/backup.db $(docker-compose -f docker-compose.prod.yml ps -q backend):/app/prod.db
    
    # Restart backend to apply changes
    docker-compose -f docker-compose.prod.yml restart backend
    echo -e "${GREEN}✅ Database restored${NC}"
fi

# Restore application data
echo -e "${YELLOW}📁 Restoring application data...${NC}"
if [ -f "$TEMP_DIR/app-data.tar.gz" ]; then
    # Extract application data
    docker-compose -f docker-compose.prod.yml exec -T backend tar -xzf /tmp/app-data.tar.gz -C /app/data
    echo -e "${GREEN}✅ Application data restored${NC}"
fi

# Start all services
echo -e "${YELLOW}🚀 Starting application...${NC}"
docker-compose -f docker-compose.prod.yml up -d

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
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs frontend
fi

# Clean up temporary directory
rm -rf $TEMP_DIR

echo ""
echo -e "${GREEN}🎉 Restore completed successfully!${NC}"
echo "===================================="
echo -e "${BLUE}🌐 Your application should now be available at:${NC}"
echo -e "   Frontend: http://localhost:3000"
echo -e "   Backend API: http://localhost:3001"
echo -e "   Health Check: http://localhost:3001/health"
echo ""
echo -e "${BLUE}🛠️ Management Commands:${NC}"
echo -e "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "   Restart: docker-compose -f docker-compose.prod.yml restart"
echo -e "   Stop: docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${GREEN}✨ Restore completed!${NC}"
