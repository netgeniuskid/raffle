# Firebase Setup for RazzWars Project

Your Firebase project `razzwars-319e6` is configured! Here's what you need to do:

## 🔥 Enable Firestore Database

1. **Go to Firebase Console**: https://console.firebase.google.com/project/razzwars-319e6
2. **Click "Firestore Database"** in the left sidebar
3. **Click "Create database"**
4. **Choose "Start in test mode"** (for development)
5. **Select a location** (choose one close to you)
6. **Click "Done"**

## 🔧 Set Up Security Rules

1. **Go to Firestore Database → Rules**
2. **Replace the default rules** with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to games collection
    match /games/{gameId} {
      allow read, write: if true; // For development - restrict in production
    }
    
    // Allow read access to player codes (to join games)
    match /playerCodes/{codeId} {
      allow read: if true;
      allow write: if true; // For development - restrict in production
    }
  }
}
```

3. **Click "Publish"**

## 🚀 Test Your Setup

1. **Visit**: http://localhost:3000/test-firebase
2. **Check the status** - should show "Firestore connected!"
3. **If you see errors**, make sure Firestore is enabled

## 🎮 Use Your Game

Once Firestore is enabled:

1. **Visit**: http://localhost:3000
2. **Click "Admin Dashboard"** to create games
3. **Click "Join Game"** to play with generated codes
4. **Games will persist** between page refreshes!

## 🔍 Troubleshooting

### If you see "Firestore error":
- Make sure Firestore Database is enabled
- Check that security rules allow read/write
- Verify your project ID is correct

### If you see "Firebase error":
- Check your API key and other config values
- Make sure your Firebase project is active

## 📊 Your Firebase Project Details

- **Project ID**: razzwars-319e6
- **Auth Domain**: razzwars-319e6.firebaseapp.com
- **Storage Bucket**: razzwars-319e6.firebasestorage.app

Once Firestore is enabled, your Razz Card Game will have:
- ✅ Persistent game state
- ✅ Real-time multiplayer
- ✅ Live card reveals
- ✅ Game history tracking

🎮 **Ready to play!**
