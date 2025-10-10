# Firebase Vercel Troubleshooting Guide

## Problem: Can't Join Game on Vercel - Firebase Connection Errors

### Symptoms
- `net::ERR_SSL_PROTOCOL_ERROR` errors
- `WebChannelConnection RPC 'Listen' stream transport errored` messages
- `400 (Bad Request)` responses from Firestore
- Games not loading or players unable to join

### Root Causes Identified
1. **Missing Environment Variables**: Firebase config not properly set in Vercel
2. **Database URL Encoding Issues**: Newline characters in database URLs
3. **Network Connection Problems**: Firestore WebSocket connections failing
4. **Missing Long Polling Configuration**: Better connection stability needed

### Solutions Implemented

#### 1. Enhanced Firebase Configuration (`frontend/lib/firebase.ts`)
- ✅ Added fallback values for development
- ✅ Implemented long polling for better connection stability
- ✅ Added environment variable validation
- ✅ Graceful fallback if long polling fails

#### 2. Environment Variables Setup
- ✅ Created `vercel-env-example.txt` with all required variables
- ✅ Created automated setup scripts (`setup-vercel-env.sh` and `setup-vercel-env.bat`)
- ✅ Added validation in debug page

#### 3. Debug Tools
- ✅ Updated debug page to use centralized Firebase config
- ✅ Added environment variable status display
- ✅ Improved error logging and diagnostics

### How to Fix Your Deployment

#### Option 1: Automated Setup (Recommended)
```bash
# For Linux/Mac
./setup-vercel-env.sh

# For Windows
setup-vercel-env.bat
```

#### Option 2: Manual Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add these variables for Production, Preview, and Development:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razzwars-319e6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=razzwars-319e6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razzwars-319e6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=211646977519
NEXT_PUBLIC_FIREBASE_APP_ID=1:211646977519:web:3589f1d44eb511c032121a
```

#### Option 3: Using Vercel CLI
```bash
# Link your project if not already linked
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Enter: AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# Enter: razzwars-319e6.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# Enter: razzwars-319e6

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# Enter: razzwars-319e6.firebasestorage.app

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# Enter: 211646977519

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# Enter: 1:211646977519:web:3589f1d44eb511c032121a

# Repeat for preview and development environments
```

### After Setting Environment Variables

1. **Redeploy your application**:
   ```bash
   vercel --prod
   ```

2. **Test the connection**:
   - Visit `your-domain.vercel.app/debug`
   - Check if all environment variables show as "✅ Set"
   - Verify Firestore read/write tests pass

3. **Test game functionality**:
   - Try creating a game as admin
   - Try joining a game as a player
   - Check browser console for any remaining errors

### Additional Troubleshooting

#### If SSL errors persist:
- Check your custom domain configuration in Vercel
- Ensure SSL certificate is properly configured
- Try accessing via the Vercel subdomain first

#### If Firestore still fails:
- Check Firebase project status at https://status.firebase.google.com/
- Verify Firestore security rules allow read/write access
- Check browser network tab for specific error details

#### If environment variables aren't working:
- Ensure variables are set for the correct environment (Production/Preview/Development)
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Testing Checklist

- [ ] Environment variables are set in Vercel
- [ ] Application redeployed after setting variables
- [ ] Debug page shows all variables as "✅ Set"
- [ ] Firestore read test passes
- [ ] Firestore write test passes
- [ ] Game creation works
- [ ] Player joining works
- [ ] No console errors

### Support

If issues persist after following this guide:
1. Check the debug page at `/debug` for specific error messages
2. Review browser console for detailed error logs
3. Verify Firebase project configuration in Firebase Console
4. Test with a fresh browser session/incognito mode

