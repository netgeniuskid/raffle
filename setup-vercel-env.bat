@echo off
REM Setup Vercel Environment Variables for Firebase
REM Run this script to set up your Vercel project with the required environment variables

echo Setting up Vercel environment variables for Firebase...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI is not installed. Please install it first:
    echo npm i -g vercel
    pause
    exit /b 1
)

REM Check if project is linked
if not exist ".vercel\project.json" (
    echo ❌ Project not linked to Vercel. Please run 'vercel link' first.
    pause
    exit /b 1
)

echo ✅ Vercel CLI found and project is linked

REM Set environment variables for production
echo Setting environment variables for production...
echo AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo razzwars-319e6.firebaseapp.com | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo razzwars-319e6 | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo razzwars-319e6.firebasestorage.app | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo 211646977519 | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo 1:211646977519:web:3589f1d44eb511c032121a | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

REM Set environment variables for preview
echo Setting environment variables for preview...
echo AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview
echo razzwars-319e6.firebaseapp.com | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview
echo razzwars-319e6 | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview
echo razzwars-319e6.firebasestorage.app | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET preview
echo 211646977519 | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID preview
echo 1:211646977519:web:3589f1d44eb511c032121a | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID preview

REM Set environment variables for development
echo Setting environment variables for development...
echo AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development
echo razzwars-319e6.firebaseapp.com | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN development
echo razzwars-319e6 | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID development
echo razzwars-319e6.firebasestorage.app | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET development
echo 211646977519 | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID development
echo 1:211646977519:web:3589f1d44eb511c032121a | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID development

echo ✅ Environment variables set successfully!
echo.
echo Next steps:
echo 1. Run 'vercel --prod' to deploy with the new environment variables
echo 2. Or trigger a new deployment from the Vercel dashboard
echo 3. Test the Firebase connection at your-domain.vercel.app/debug
pause

