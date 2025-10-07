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
  
  // Build the frontend with minimal memory usage
  console.log('🔧 Building frontend with minimal memory...');
  const build = spawn('npm', ['run', 'build:minimal'], { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=256', // Limit memory usage to 256MB
      SKIP_ENV_VALIDATION: 'true'
    }
  });
  
  build.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to build frontend');
      process.exit(1);
    }
    
    console.log('✅ Frontend built successfully');
    
    // Start the production server
    console.log('🚀 Starting production server...');
    const start = spawn('npm', ['run', 'start'], { stdio: 'inherit' });
    
    start.on('close', (code) => {
      console.log(`Frontend server exited with code ${code}`);
      process.exit(code);
    });
  });
});
