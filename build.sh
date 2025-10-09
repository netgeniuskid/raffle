#!/bin/bash

# Production Build Script for Razz Card Game

set -e

echo "🏗️ Building Razz Card Game for production..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build backend
echo "📦 Building backend..."
cd backend
docker build -t razz-backend:latest .
cd ..

# Build frontend
echo "📦 Building frontend..."
cd frontend
docker build -t razz-frontend:latest .
cd ..

echo "✅ Build complete!"
echo ""
echo "🐳 Images created:"
echo "   - razz-backend:latest"
echo "   - razz-frontend:latest"
echo ""
echo "🚀 To deploy:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔍 To test locally:"
echo "   docker-compose up -d"
