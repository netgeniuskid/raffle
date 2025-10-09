# Firestore Security Rules for Production Mode

Since you enabled Firestore in production mode, you need to set up proper security rules. Here are the rules for your RazzWars project:

## 🔒 Production Security Rules

Go to Firebase Console → Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection - allow read/write for authenticated users
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
    
    // Player codes collection - allow read for anyone (to join games)
    match /playerCodes/{codeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔓 Development Rules (if you want to test without auth)

If you want to test without authentication first, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🚀 Deploy to Vercel

Now let's deploy your Firebase-enabled app to Vercel:

1. **Set Environment Variables in Vercel**:
   - Go to your Vercel project settings
   - Add these environment variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razzwars-319e6.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=razzwars-319e6
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razzwars-319e6.firebasestorage.app
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=211646977519
     NEXT_PUBLIC_FIREBASE_APP_ID=1:211646977519:web:3589f1d44eb511c032121a
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-LZVQCLHGPC
     ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔧 Alternative: Use Firebase Hosting

You can also deploy directly to Firebase Hosting:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## 📊 Benefits of Production Mode

With production mode enabled:
- ✅ **Better security** with proper authentication
- ✅ **Scalable** for multiple users
- ✅ **Real-time updates** work perfectly
- ✅ **Persistent state** across all deployments
- ✅ **No serverless limitations**

Your RazzWars game will now work perfectly on Vercel with Firebase! 🎮
