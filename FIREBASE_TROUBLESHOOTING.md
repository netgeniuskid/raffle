# 🔥 Firebase + Vercel Troubleshooting Guide

## 🚨 **Issue: Games Not Saving**

Your app is deployed but games aren't persisting because Firestore security rules need to be configured.

## ✅ **Step 1: Set Up Firestore Security Rules**

### **Go to Firebase Console:**
1. **Visit**: https://console.firebase.google.com/project/razzwars-319e6
2. **Click "Firestore Database"** in the left sidebar
3. **Click "Rules"** tab

### **Replace the rules with:**
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

### **Click "Publish"**

## 🔍 **Step 2: Verify Firebase Connection**

### **Test Your App:**
1. **Visit**: https://frontend-d1zfysdgn-vangelis-projects-4e7374cc.vercel.app
2. **Open Browser Developer Tools** (F12)
3. **Go to Console tab**
4. **Look for Firebase errors**

### **Expected Behavior:**
- ✅ No Firebase connection errors
- ✅ Games should save when created
- ✅ Games should persist between page refreshes

## 🛠️ **Step 3: Debug Common Issues**

### **If you see Firebase errors:**

#### **Error: "Missing or insufficient permissions"**
- **Solution**: Firestore rules not set up correctly
- **Fix**: Use the rules above and click "Publish"

#### **Error: "Firebase: No Firebase App '[DEFAULT]' has been created"**
- **Solution**: Environment variables not loaded
- **Fix**: Check Vercel environment variables are set

#### **Error: "Firebase: Error (auth/network-request-failed)"**
- **Solution**: Network/CORS issue
- **Fix**: Check Firebase project is active

## 🔧 **Step 4: Verify Environment Variables**

### **Check Vercel Environment Variables:**
1. **Go to**: https://vercel.com/vangelis-projects-4e7374cc/frontend/settings/environment-variables
2. **Verify all 7 Firebase variables are present:**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## 🎮 **Step 5: Test Game Creation**

### **After setting up rules:**
1. **Visit your app**: https://frontend-d1zfysdgn-vangelis-projects-4e7374cc.vercel.app
2. **Click "Admin Dashboard"**
3. **Click "Create New Game"**
4. **Fill out the form and submit**
5. **Check if game appears in the list**
6. **Refresh the page - game should still be there**

## 🚨 **If Still Not Working:**

### **Check Firebase Console:**
1. **Go to**: https://console.firebase.google.com/project/razzwars-319e6/firestore/data
2. **Look for "games" collection**
3. **If empty, there's a connection issue**

### **Check Browser Console:**
1. **Open Developer Tools (F12)**
2. **Go to Console tab**
3. **Look for red error messages**
4. **Share any errors you see**

## 📊 **Expected Firebase Collections:**

After successful setup, you should see:
- **`games`** - Contains your game data
- **`playerCodes`** - Contains player access codes

## 🎯 **Quick Test:**

1. **Set up Firestore rules** (most important!)
2. **Create a game** in your app
3. **Check Firebase Console** - you should see the game data
4. **Refresh your app** - game should still be there

The most common issue is missing Firestore security rules. Once you set those up, your games will start saving! 🎮
