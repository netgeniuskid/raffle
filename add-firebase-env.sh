#!/bin/bash

# Add Firebase environment variables to Vercel
echo "Adding Firebase environment variables to Vercel..."

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< "razzwars-319e6.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< "razzwars-319e6"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< "razzwars-319e6.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< "211646977519"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< "1:211646977519:web:3589f1d44eb511c032121a"
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production <<< "G-LZVQCLHGPC"

echo "All Firebase environment variables added successfully!"
echo "Now redeploying..."
vercel --prod --yes
