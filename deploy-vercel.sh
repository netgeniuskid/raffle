#!/bin/bash

# Vercel Deployment Script for Razz Card Game
# This script helps deploy the application to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vercel Deployment Script for Razz Card Game${NC}"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed successfully${NC}"
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Vercel...${NC}"
    vercel login
fi

echo -e "${BLUE}📋 Deployment Options${NC}"
echo "====================="
echo "1. Deploy Frontend Only (Recommended for MVP)"
echo "2. Deploy Backend Only"
echo "3. Deploy Both (Advanced)"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🎨 Deploying Frontend...${NC}"
        cd frontend
        
        # Check if .env.local exists
        if [ ! -f ".env.local" ]; then
            echo -e "${YELLOW}⚙️  Creating environment file...${NC}"
            read -p "Enter your backend API URL: " API_URL
            read -p "Enter your admin key: " ADMIN_KEY
            
            cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_ADMIN_KEY=$ADMIN_KEY
EOF
        fi
        
        # Deploy to Vercel
        vercel --prod
        echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
        ;;
        
    2)
        echo -e "${BLUE}🔧 Deploying Backend...${NC}"
        cd backend
        
        # Check if environment variables are set
        echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"
        read -p "Enter JWT secret: " JWT_SECRET
        read -p "Enter frontend URL: " FRONTEND_URL
        read -p "Enter admin key: " ADMIN_KEY
        
        # Set environment variables
        vercel env add JWT_SECRET production <<< "$JWT_SECRET"
        vercel env add JWT_EXPIRES_IN production <<< "30m"
        vercel env add NODE_ENV production <<< "production"
        vercel env add FRONTEND_URL production <<< "$FRONTEND_URL"
        vercel env add ADMIN_KEY production <<< "$ADMIN_KEY"
        vercel env add DATABASE_URL production <<< "file:./prod.db"
        
        # Deploy to Vercel
        vercel --prod
        echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
        ;;
        
    3)
        echo -e "${BLUE}🚀 Deploying Both Frontend and Backend...${NC}"
        
        # Deploy backend first
        echo -e "${YELLOW}🔧 Deploying Backend...${NC}"
        cd backend
        
        read -p "Enter JWT secret: " JWT_SECRET
        read -p "Enter admin key: " ADMIN_KEY
        
        vercel env add JWT_SECRET production <<< "$JWT_SECRET"
        vercel env add JWT_EXPIRES_IN production <<< "30m"
        vercel env add NODE_ENV production <<< "production"
        vercel env add ADMIN_KEY production <<< "$ADMIN_KEY"
        vercel env add DATABASE_URL production <<< "file:./prod.db"
        
        BACKEND_URL=$(vercel --prod | grep -o 'https://[^[:space:]]*')
        echo -e "${GREEN}✅ Backend deployed at: $BACKEND_URL${NC}"
        
        # Deploy frontend
        echo -e "${YELLOW}🎨 Deploying Frontend...${NC}"
        cd ../frontend
        
        # Update frontend environment
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_ADMIN_KEY=$ADMIN_KEY
EOF
        
        FRONTEND_URL=$(vercel --prod | grep -o 'https://[^[:space:]]*')
        echo -e "${GREEN}✅ Frontend deployed at: $FRONTEND_URL${NC}"
        
        # Update backend with frontend URL
        cd ../backend
        vercel env add FRONTEND_URL production <<< "$FRONTEND_URL"
        vercel --prod
        
        echo -e "${GREEN}🎉 Both services deployed successfully!${NC}"
        echo -e "${BLUE}🌐 Your application is available at:${NC}"
        echo -e "   Frontend: $FRONTEND_URL"
        echo -e "   Backend: $BACKEND_URL"
        ;;
        
    4)
        echo -e "${YELLOW}👋 Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option. Please choose 1-4.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo "=============================================="
echo -e "${BLUE}💡 Next Steps:${NC}"
echo -e "   1. Test your application"
echo -e "   2. Set up custom domain (optional)"
echo -e "   3. Configure monitoring"
echo -e "   4. Set up backups"
echo ""
echo -e "${BLUE}🛠️ Management Commands:${NC}"
echo -e "   View deployments: vercel ls"
echo -e "   View logs: vercel logs"
echo -e "   Open dashboard: vercel dashboard"
echo ""
echo -e "${GREEN}✨ Enjoy your deployed Razz Card Game!${NC}"
