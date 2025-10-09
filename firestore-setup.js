const https = require('https');

// Firebase project configuration
const projectId = 'razzwars-319e6';
const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

console.log('🚀 Attempting to set Firestore rules via Firebase REST API...');
console.log('');

// Note: This would require authentication tokens, so let's provide manual instructions instead
console.log('📋 MANUAL SETUP REQUIRED:');
console.log('');
console.log('Since Firebase requires authentication, please follow these steps:');
console.log('');
console.log('1. 🌐 Open: https://console.firebase.google.com/project/razzwars-319e6');
console.log('2. 📁 Click "Firestore Database" in the left sidebar');
console.log('3. 🔒 Click "Rules" tab');
console.log('4. 📝 Replace ALL existing rules with:');
console.log('');
console.log('```');
console.log(rules);
console.log('```');
console.log('');
console.log('5. ✅ Click "Publish" button');
console.log('');
console.log('🎯 After publishing, your games will start saving!');
console.log('');
console.log('🔍 To verify it worked:');
console.log('- Create a game in your app');
console.log('- Refresh the page');
console.log('- Game should still be there!');
