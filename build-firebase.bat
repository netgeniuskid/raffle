@echo off
REM Firebase Build Script for Razz Card Game
REM This script builds the frontend for Firebase Hosting

echo 🔥 Building for Firebase Hosting
echo ==================================

REM Check if we're in the right directory
if not exist "frontend\package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Navigate to frontend directory
cd frontend

echo 🔧 Setting up environment variables...
REM Create environment file for Firebase build
(
echo NEXT_PUBLIC_API_URL=https://razzwars-319e6.firebaseapp.com
echo NEXT_PUBLIC_ADMIN_KEY=admin123
echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razzwars-319e6.firebaseapp.com
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=razzwars-319e6
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razzwars-319e6.firebasestorage.app
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=211646977519
echo NEXT_PUBLIC_FIREBASE_APP_ID=1:211646977519:web:3589f1d44eb511c032121a
) > .env.local

echo 📦 Installing dependencies...
call npm install

echo 🔧 Building frontend for static export...
call npm run build

REM Check if build was successful
if exist "out" (
    echo ✅ Build successful! Static files generated in frontend\out
) else (
    echo ❌ Build failed! No 'out' directory found
    exit /b 1
)

REM Go back to root directory
cd ..

echo 🎉 Firebase build completed successfully!
echo ==================================
echo 📁 Static files are ready in: frontend\out
echo 🚀 You can now deploy with: firebase deploy
