@echo off
REM Production Build Script for Razz Card Game

echo 🏗️ Building Razz Card Game for production...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build backend
echo 📦 Building backend...
cd backend
docker build -t razz-backend:latest .
cd ..

REM Build frontend
echo 📦 Building frontend...
cd frontend
docker build -t razz-frontend:latest .
cd ..

echo ✅ Build complete!
echo.
echo 🐳 Images created:
echo    - razz-backend:latest
echo    - razz-frontend:latest
echo.
echo 🚀 To deploy:
echo    docker-compose -f docker-compose.prod.yml up -d
echo.
echo 🔍 To test locally:
echo    docker-compose up -d
