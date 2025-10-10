#!/bin/bash

# Setup Vercel Environment Variables for Firebase
# Run this script to set up your Vercel project with the required environment variables

echo "Setting up Vercel environment variables for Firebase..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Project not linked to Vercel. Please run 'vercel link' first."
    exit 1
fi

echo "✅ Vercel CLI found and project is linked"

# Set environment variables
echo "Setting environment variables..."

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< "razzwars-319e6.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< "razzwars-319e6"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< "razzwars-319e6.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< "211646977519"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< "1:211646977519:web:3589f1d44eb511c032121a"

# Also set for preview and development
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview <<< "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview <<< "razzwars-319e6.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview <<< "razzwars-319e6"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET preview <<< "razzwars-319e6.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID preview <<< "211646977519"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID preview <<< "1:211646977519:web:3589f1d44eb511c032121a"

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development <<< "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN development <<< "razzwars-319e6.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID development <<< "razzwars-319e6"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET development <<< "razzwars-319e6.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID development <<< "211646977519"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID development <<< "1:211646977519:web:3589f1d44eb511c032121a"

echo "✅ Environment variables set successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel --prod' to deploy with the new environment variables"
echo "2. Or trigger a new deployment from the Vercel dashboard"
echo "3. Test the Firebase connection at your-domain.vercel.app/debug"

