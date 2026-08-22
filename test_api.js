const http = require('http');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, error: 'Not JSON' });
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    try {
        console.log('Fetching products...');
        const res = await fetchUrl('http://localhost:5000/api/products');
        console.log('Status:', res.status);
        if (res.data && res.data.data) {
            console.log('Products count:', res.data.data.length);
            console.log('First product:', res.data.data[0]);
        } else {
            console.log('Response data:', res.data);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
