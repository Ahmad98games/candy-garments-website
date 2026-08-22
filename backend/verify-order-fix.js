const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');

async function verify() {
    console.log('🚀 Starting Verification: Order Path Connectivity');

    // 1. Start backend in background
    const serverProcess = exec('node server.js', {
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'production' } // Force production to test the hard check
    });

    console.log('⏳ Waiting for server to bind to port 5000...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    try {
        console.log('📡 Testing Order Endpoint...');
        const response = await axios.post('http://127.0.0.1:5000/api/orders', {
            customerInfo: { name: 'Test User', email: 'test@example.com', phone: '123' },
            items: [],
            totalAmount: 100
        }, {
            headers: { 'X-Api-Version': '1' },
            validateStatus: () => true
        });

        console.log(`✅ Received Status: ${response.status}`);
        console.log(`✅ System Mode Header: ${response.headers['x-system-mode']}`);

        if (response.status === 503) {
            console.log('🎯 SUCCESS: Server is alive and correctly blocking mutations in DEGRADED mode.');
        } else if (response.status === 201) {
            console.log('🎯 SUCCESS: Server is alive and order placed successfully.');
        } else {
            console.log(`⚠️ UNEXPECTED STATUS: ${response.status}`);
        }

    } catch (err) {
        console.error('❌ VERIFICATION FAILED:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server is NOT listening on port 5000.');
        }
    } finally {
        console.log('🧹 Cleaning up server process...');
        serverProcess.kill('SIGKILL');
        exec('taskkill /f /im node.exe /fi "windowtitle eq node server.js*"', () => { });
    }
}

verify();
