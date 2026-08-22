const axios = require('axios');

async function testSubscription() {
    const ports = [5000];
    const email = `test_${Date.now()}@example.com`;

    for (const port of ports) {
        try {
            console.log(`Trying port ${port}...`);
            const url = `http://localhost:${port}/api/newsletter/subscribe`;
            const response = await axios.post(url, { email });
            console.log(`Success on port ${port}!`);
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            return;
        } catch (error) {
            if (error.response) {
                console.log(`Port ${port} responded with status ${error.response.status}`);
                console.log('Data:', JSON.stringify(error.response.data));
            } else {
                console.log(`Error on port ${port}:`, error.message);
            }
        }
    }
    console.log('Could not subscribe on any common port.');
}

testSubscription();
