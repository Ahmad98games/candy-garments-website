const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Development Server in LocalDB Mode...');

// Unset MONGODB_URI to force LocalDB
process.env.MONGODB_URI = '';
process.env.NODE_ENV = 'development';

const serverScript = path.join(__dirname, '../server.js');

// Use node --watch if available (Node 18.11+), else just node
// Since package.json used --watch, we assume it's available.
const args = ['--watch', serverScript];

const child = spawn('node', args, {
    stdio: 'inherit',
    env: process.env,
    cwd: path.join(__dirname, '..')
});

child.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
});
