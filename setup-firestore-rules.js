// Firebase Rules Setup Script
// This will set up the Firestore security rules for your project

const https = require('https');

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

console.log('🔥 Setting up Firestore security rules...');
console.log('Project ID:', projectId);
console.log('');
console.log('Rules to be applied:');
console.log(rules);
console.log('');
console.log('⚠️  IMPORTANT: You need to manually set these rules in Firebase Console:');
console.log('');
console.log('1. Go to: https://console.firebase.google.com/project/razzwars-319e6');
console.log('2. Click "Firestore Database" → "Rules"');
console.log('3. Replace the existing rules with the rules above');
console.log('4. Click "Publish"');
console.log('');
console.log('This will allow your app to read/write to Firestore!');
