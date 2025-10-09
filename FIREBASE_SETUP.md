# Firebase Setup Guide for Razz Card Game

This guide will help you set up Firebase for your Razz Card Game to enable persistent game state and real-time multiplayer functionality.

## 🚀 Quick Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Click "Create a project" or "Add project"

2. **Configure Project**
   - **Project name**: `razz-card-game` (or your preferred name)
   - **Enable Google Analytics**: Optional (recommended for production)
   - Click "Create project"

### Step 2: Enable Firestore Database

1. **Go to Firestore Database**
   - In your Firebase project, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - **Start in test mode**: For development (allows read/write for 30 days)
   - **Start in production mode**: For production (requires custom rules)

3. **Choose Location**
   - Select a location close to your users
   - Click "Done"

### Step 3: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the gear icon → "Project settings"
   - Scroll down to "Your apps" section

2. **Add Web App**
   - Click "Add app" → Web icon (`</>`)
   - **App nickname**: `razz-frontend`
   - **Enable Firebase Hosting**: Optional
   - Click "Register app"

3. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - You'll need these values for your environment variables

### Step 4: Configure Environment Variables

1. **Create `.env.local` file** in your `frontend` directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

2. **Replace the values** with your actual Firebase configuration

### Step 5: Set Up Firestore Security Rules

1. **Go to Firestore Database → Rules**
2. **Replace the default rules** with:

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

### Step 6: Test Firebase Connection

1. **Start your development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Check browser console** for any Firebase errors
3. **Create a test game** to verify Firestore integration

## 🔧 Advanced Configuration

### Enable Authentication (Optional)

1. **Go to Authentication**
   - Click "Authentication" in Firebase console
   - Click "Get started"

2. **Enable Sign-in Methods**
   - **Email/Password**: For admin login
   - **Anonymous**: For quick player access
   - **Google**: For social login

### Set Up Firebase Hosting (Optional)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure hosting**:
   - **Public directory**: `out` (for Next.js static export)
   - **Single-page app**: Yes
   - **Overwrite index.html**: No

4. **Deploy**:
   ```bash
   firebase deploy
   ```

## 📊 Firestore Data Structure

Your Firebase database will have these collections:

### Games Collection (`/games`)
```javascript
{
  id: "game123",
  name: "My Game",
  status: "IN_PROGRESS",
  totalCards: 20,
  prizeCount: 3,
  playerSlots: 4,
  createdAt: timestamp,
  cards: [
    {
      id: "card-0",
      positionIndex: 0,
      isRevealed: false,
      isPrize: true,
      prizeNames: ["Prize 1"]
    }
  ],
  players: [
    {
      id: "player123",
      username: "Player 1",
      playerIndex: 0,
      connected: true,
      joinedAt: timestamp
    }
  ],
  currentPlayerIndex: 0,
  picks: [
    {
      id: "pick123",
      playerId: "player123",
      cardIndex: 0,
      wasPrize: true,
      timestamp: timestamp,
      prizeNames: ["Prize 1"]
    }
  ],
  adminId: "admin123"
}
```

### Player Codes Collection (`/playerCodes`)
```javascript
{
  id: "code123",
  username: "Player 1",
  code: "ABC123",
  gameId: "game123",
  createdAt: timestamp
}
```

## 🚀 Benefits of Firebase Integration

### ✅ What Firebase Solves:
- **Persistent Game State**: Games survive server restarts
- **Real-time Updates**: Players see changes instantly
- **Scalable Database**: Handles multiple concurrent games
- **Authentication**: Secure admin and player access
- **Hosting**: Deploy frontend to Firebase Hosting

### ✅ New Features Enabled:
- **Live Game Updates**: Players see card picks in real-time
- **Persistent Games**: Games don't disappear between requests
- **Multi-device Support**: Players can join from any device
- **Game History**: Track all game events and picks
- **Admin Dashboard**: Real-time game management

## 🔄 Migration from Current Backend

The Firebase integration is designed to work alongside your existing backend:

1. **Gradual Migration**: Keep both systems running
2. **Feature Parity**: All current functionality preserved
3. **Enhanced Features**: Add real-time capabilities
4. **Better Performance**: Faster database operations

## 🛠️ Troubleshooting

### Common Issues:

1. **Firebase not initialized**
   - Check environment variables are set correctly
   - Verify Firebase project configuration

2. **Permission denied**
   - Check Firestore security rules
   - Ensure user is authenticated (if required)

3. **Real-time updates not working**
   - Check network connection
   - Verify `onSnapshot` listeners are set up correctly

### Debug Mode:
```javascript
// Add to your Firebase config for debugging
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📈 Next Steps

After Firebase setup:

1. **Test basic functionality** (create, join, start games)
2. **Implement real-time updates** in your components
3. **Add authentication** for admin features
4. **Deploy to Firebase Hosting** for production
5. **Monitor usage** in Firebase console

Your Razz Card Game will now have persistent state and real-time multiplayer capabilities! 🎮
