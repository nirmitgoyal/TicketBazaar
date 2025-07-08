#!/usr/bin/env node

/**
 * Test script to verify WebSocket is properly disabled in production
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Testing WebSocket in production mode...\n');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the production server
const server = spawn('npm', ['run', 'start'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'pipe'
});

let serverOutput = '';
let serverReady = false;

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log(`[SERVER]: ${data.toString().trim()}`);
  
  if (data.toString().includes('Server running on port') || data.toString().includes('listening on')) {
    serverReady = true;
    console.log('✅ Production server started successfully\n');
    
    // Check if WebSocket server is NOT started
    if (!serverOutput.includes('WebSocket server') && !serverOutput.includes('ws://')) {
      console.log('✅ WebSocket server is correctly disabled in production\n');
    } else {
      console.log('❌ WebSocket server appears to be running in production\n');
    }
    
    // Give it a moment then kill the server
    setTimeout(() => {
      server.kill('SIGTERM');
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.log(`[SERVER ERROR]: ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`\n🏁 Server process exited with code ${code}`);
  
  // Check the client build for WebSocket traces
  const clientBuild = path.join(__dirname, 'dist', 'public', 'assets');
  if (fs.existsSync(clientBuild)) {
    const files = fs.readdirSync(clientBuild);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    console.log('🔍 Checking client build for WebSocket traces...');
    let foundWebSocketCode = false;
    
    jsFiles.forEach(file => {
      const filePath = path.join(clientBuild, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('WebSocket') || content.includes('ws://') || content.includes('wss://')) {
        console.log(`⚠️  Found WebSocket reference in ${file}`);
        foundWebSocketCode = true;
      }
    });
    
    if (!foundWebSocketCode) {
      console.log('✅ No WebSocket code found in production client build');
    }
  }
  
  console.log('\n🎯 Production WebSocket test completed');
  process.exit(0);
});

// Handle timeout
setTimeout(() => {
  if (!serverReady) {
    console.log('❌ Server did not start within timeout period');
    server.kill('SIGTERM');
    process.exit(1);
  }
}, 10000);
