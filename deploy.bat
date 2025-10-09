@echo off
REM Razz Card Game Deployment Script for Windows
REM This script builds and deploys the application using Docker

echo 🚀 Starting Razz Card Game deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build and start services
echo 📦 Building Docker images...
docker-compose build

echo 🗄️ Starting services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running at http://localhost:3001
) else (
    echo ❌ Backend health check failed
    docker-compose logs backend
    exit /b 1
)

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:3000
) else (
    echo ❌ Frontend health check failed
    docker-compose logs frontend
    exit /b 1
)

echo 🎉 Deployment successful!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    Health Check: http://localhost:3001/health
echo.
echo 📋 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart
