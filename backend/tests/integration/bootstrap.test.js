const request = require('supertest');
const mongoose = require('mongoose');
const bootstrap = require('../../bootstrap');

describe('Bootstrap & Resilience Integration Tests', () => {
    let app;
    let config;

    beforeAll(async () => {
        // Ensure we are in test mode
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'test-secret-123';
        process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/omnora_bootstrap_test';

        const result = await bootstrap();
        app = result.app;
        config = result.config;
    });

    afterAll(async () => {
        const dbService = require('../../services/dbService');
        await dbService.disconnect();
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }
    });

    describe('System Liveness & Readiness', () => {
        it('should respond to /api/health/live', async () => {
            const res = await request(app).get('/api/live');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });

        it('should respond to /api/health/ready when system is healthy', async () => {
            const res = await request(app).get('/api/ready');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ready');
            expect(res.body.database).toBe('connected');
        });
    });

    describe('Order Flow Resilience', () => {
        it('should complete a guest checkout flow successfully', async () => {
            const orderData = {
                customerInfo: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '03001234567'
                },
                shippingAddress: {
                    address: '123 Street',
                    city: 'Lahore',
                    country: 'Pakistan'
                },
                paymentMethod: 'cod',
                items: [
                    { productId: new mongoose.Types.ObjectId(), name: 'Test Product', price: 1000, quantity: 1 }
                ],
                totalAmount: 1250 // subtotal + tax + shipping
            };

            const res = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.order).toBeDefined();
        });
    });
});
