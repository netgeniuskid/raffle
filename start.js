#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Razz Card Game Backend...');

// Change to backend directory and start the server
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

console.log('📁 Changed to backend directory:', backendPath);

// Install dependencies if needed
console.log('📦 Installing dependencies...');
const install = spawn('npm', ['install'], { stdio: 'inherit' });

install.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('✅ Dependencies installed');
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  const prisma = spawn('npx', ['prisma', 'generate'], { stdio: 'inherit' });
  
  prisma.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to generate Prisma client');
      process.exit(1);
    }
    
    console.log('✅ Prisma client generated');
    
    // Start the server
    console.log('🚀 Starting server...');
    const start = spawn('npm', ['run', 'start'], { stdio: 'inherit' });
    
    start.on('close', (code) => {
      console.log(`Server exited with code ${code}`);
      process.exit(code);
    });
  });
});
