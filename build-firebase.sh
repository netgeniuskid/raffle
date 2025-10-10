#!/bin/bash

# Firebase Build Script for Razz Card Game
# This script builds the frontend for Firebase Hosting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 Building for Firebase Hosting${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo -e "${BLUE}🔧 Setting up environment variables...${NC}"
# Create environment file for Firebase build
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://razzwars-319e6.firebaseapp.com
NEXT_PUBLIC_ADMIN_KEY=admin123
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razzwars-319e6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=razzwars-319e6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razzwars-319e6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=211646977519
NEXT_PUBLIC_FIREBASE_APP_ID=1:211646977519:web:3589f1d44eb511c032121a
EOF

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔧 Building frontend for static export...${NC}"
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo -e "${GREEN}✅ Build successful! Static files generated in frontend/out${NC}"
else
    echo -e "${RED}❌ Build failed! No 'out' directory found${NC}"
    exit 1
fi

# Go back to root directory
cd ..

echo -e "${GREEN}🎉 Firebase build completed successfully!${NC}"
echo "=================================="
echo -e "${BLUE}📁 Static files are ready in: frontend/out${NC}"
echo -e "${BLUE}🚀 You can now deploy with: firebase deploy${NC}"
