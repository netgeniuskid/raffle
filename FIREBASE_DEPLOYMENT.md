# Firebase Hosting Deployment Guide

This guide will help you deploy the Razz Card Game to Firebase Hosting.

## 🚀 Quick Deployment

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase Project
```bash
# In your project root directory
firebase init hosting
# Select your existing Firebase project: razzwars-319e6
# Public directory: frontend/out
# Single-page app: Yes
# Overwrite index.html: No
```

### Step 3: Build and Deploy
```bash
# Build the frontend for static export
./build-firebase.sh
# OR on Windows:
# build-firebase.bat

# Deploy to Firebase Hosting
firebase deploy
```

## 🔧 Manual Build Process

If the automated script doesn't work, follow these steps:

### 1. Configure Next.js for Static Export
The `frontend/next.config.js` is already configured with:
```javascript
output: 'export',
trailingSlash: true,
images: { unoptimized: true },
distDir: 'out'
```

### 2. Set Environment Variables
Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_API_URL=https://razzwars-319e6.firebaseapp.com
NEXT_PUBLIC_ADMIN_KEY=admin123
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razzwars-319e6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=razzwars-319e6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razzwars-319e6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=211646977519
NEXT_PUBLIC_FIREBASE_APP_ID=1:211646977519:web:3589f1d44eb511c032121a
```

### 3. Build the Frontend
```bash
cd frontend
npm install
npm run build
```

### 4. Deploy to Firebase
```bash
# From project root
firebase deploy
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails with "window is not defined"**
   - Fixed: Added `typeof window !== 'undefined'` checks
   - All window/document usage is now safe for static export

2. **Environment variables not loading**
   - Make sure `.env.local` is in the `frontend/` directory
   - Variables must start with `NEXT_PUBLIC_`

3. **Firebase hosting shows 404 errors**
   - Check that `firebase.json` points to `frontend/out`
   - Ensure `trailingSlash: true` in Next.js config

4. **Images not loading**
   - Images are set to `unoptimized: true` for static export
   - All images should be in `frontend/public/`

### Debug Steps:

1. **Check build output:**
   ```bash
   cd frontend
   npm run build
   ls -la out/
   ```

2. **Test locally:**
   ```bash
   cd frontend
   npx serve out
   ```

3. **Check Firebase configuration:**
   ```bash
   firebase hosting:channel:list
   firebase hosting:channel:open live
   ```

## 📁 File Structure After Build

```
frontend/
├── out/                    # Static export output
│   ├── index.html
│   ├── _next/
│   └── ...
├── .env.local             # Environment variables
├── next.config.js         # Static export config
└── ...

firebase.json              # Firebase hosting config
```

## 🔄 Update Process

To update your deployment:

1. **Make code changes**
2. **Build again:**
   ```bash
   ./build-firebase.sh
   ```
3. **Deploy:**
   ```bash
   firebase deploy
   ```

## 🌐 Your Live URL

After successful deployment, your app will be available at:
- **https://razzwars-319e6.web.app**
- **https://razzwars-319e6.firebaseapp.com**

## ✨ Features Included

- ✅ **Visual card shuffling** - Cards move to different positions
- ✅ **Game ending logic** - Game ends when prize is won
- ✅ **Firebase backend** - Real-time database
- ✅ **Responsive design** - Works on all devices
- ✅ **Admin dashboard** - Create and manage games
- ✅ **Player lobby** - Join games with codes

Your Razz Card Game is now live on Firebase Hosting! 🎉
