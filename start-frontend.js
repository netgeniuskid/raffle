#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Razz Card Game Frontend...');

// Change to frontend directory and start the server
const frontendPath = path.join(__dirname, 'frontend');
process.chdir(frontendPath);

console.log('📁 Changed to frontend directory:', frontendPath);

// Install dependencies if needed
console.log('📦 Installing dependencies...');
const install = spawn('npm', ['install'], { stdio: 'inherit' });

install.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('✅ Dependencies installed');
  
  // Skip build and run in development mode to avoid memory issues
  console.log('🚀 Starting frontend in development mode (no build required)...');
  const build = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=256', // Limit memory usage to 256MB
      PORT: process.env.PORT || '3000'
    }
  });
  
  build.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to start frontend');
      process.exit(1);
    }
  });
});
