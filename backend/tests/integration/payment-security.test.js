/**
 * Payment Security Integration Tests
 * Tests all 7 critical security requirements for the payment approval system
 * 
 * Prerequisites:
 * - MongoDB running
 * - Backend server NOT running (supertest will start it)
 * - Test fixtures in tests/fixtures/
 */

const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Mock app for testing
let app;
let server;
let Order;

beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/omnora_test';
    await mongoose.connect(mongoUri);

    // Load models
    Order = require('../../models/Order');

    // Load app
    app = require('../../server');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (server) server.close();
});

describe('Payment Security Integration Tests', () => {

    describe('Test 1: Expired Token Rejection', () => {
        it('should reject approval with expired token', async () => {
            // Create order with expired token
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'receipt_submitted',
                approvalToken: 'test-token-123',
                approvalTokenExpires: new Date('2024-01-01') // Past date
            });

            const res = await request(app)
                .get(`/api/orders/${order._id}/approve?token=test-token-123`)
                .expect(403);

            expect(res.body.error).toMatch(/expired/i);
        });
    });

    describe('Test 2: Invalid Token Rejection', () => {
        it('should reject approval with invalid token', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'receipt_submitted',
                approvalToken: 'correct-token',
                approvalTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .get(`/api/orders/${order._id}/approve?token=wrong-token`)
                .expect(403);

            expect(res.body.error).toMatch(/invalid|expired/i);
        });
    });

    describe('Test 3: Double Approval Prevention', () => {
        it('should prevent approving the same order twice', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'receipt_submitted',
                approvalToken: 'approval-token',
                approvalTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            // First approval - should succeed
            const firstRes = await request(app)
                .get(`/api/orders/${order._id}/approve?token=approval-token`)
                .expect(200);

            expect(firstRes.body.success).toBe(true);

            // Second approval - should return "already approved"
            const secondRes = await request(app)
                .get(`/api/orders/${order._id}/approve?token=approval-token`)
                .expect(200);

            expect(secondRes.body.message).toMatch(/already approved/i);

            // Verify tokens were removed from database
            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.approvalToken).toBeUndefined();
            expect(updatedOrder.approvalTokenExpires).toBeUndefined();
        });
    });

    describe('Test 4: Duplicate Receipt Upload Prevention', () => {
        it('should prevent uploading receipt twice', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'pending'
            });

            // Create a test image file
            const testImagePath = path.join(__dirname, '../fixtures/test-receipt.jpg');
            if (!fs.existsSync(path.dirname(testImagePath))) {
                fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
            }
            // Create a minimal valid JPEG (magic bytes: FF D8 FF)
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
            fs.writeFileSync(testImagePath, jpegBuffer);

            // First upload - should succeed
            const firstRes = await request(app)
                .post(`/api/orders/${order._id}/receipt`)
                .attach('receipt', testImagePath)
                .expect(200);

            expect(firstRes.body.success).toBe(true);

            // Second upload - should fail
            const secondRes = await request(app)
                .post(`/api/orders/${order._id}/receipt`)
                .attach('receipt', testImagePath)
                .expect(400);

            expect(secondRes.body.error).toMatch(/already submitted|approved/i);

            // Cleanup
            fs.unlinkSync(testImagePath);
        });
    });

    describe('Test 5: Malicious File Type Rejection', () => {
        it('should reject .php file upload', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'pending'
            });

            const phpFilePath = path.join(__dirname, '../fixtures/malicious.php');
            if (!fs.existsSync(path.dirname(phpFilePath))) {
                fs.mkdirSync(path.dirname(phpFilePath), { recursive: true });
            }
            fs.writeFileSync(phpFilePath, '<?php system("ls"); ?>');

            const res = await request(app)
                .post(`/api/orders/${order._id}/receipt`)
                .attach('receipt', phpFilePath)
                .expect(400);

            expect(res.body.error).toMatch(/extension|allowed/i);

            // Cleanup
            fs.unlinkSync(phpFilePath);
        });

        it('should reject .php renamed to .jpg (magic byte check)', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'pending'
            });

            const fakeJpgPath = path.join(__dirname, '../fixtures/fake.jpg');
            if (!fs.existsSync(path.dirname(fakeJpgPath))) {
                fs.mkdirSync(path.dirname(fakeJpgPath), { recursive: true });
            }
            // Write PHP content but name it .jpg
            fs.writeFileSync(fakeJpgPath, '<?php system("ls"); ?>');

            const res = await request(app)
                .post(`/api/orders/${order._id}/receipt`)
                .attach('receipt', fakeJpgPath)
                .expect(400);

            expect(res.body.error).toMatch(/only images|allowed/i);

            // Cleanup
            fs.unlinkSync(fakeJpgPath);
        });
    });

    describe('Test 6: Rate Limit Enforcement', () => {
        it('should enforce 5 uploads per 15 minutes rate limit', async () => {
            const orders = [];

            // Create 6 orders
            for (let i = 0; i < 6; i++) {
                const order = await Order.create({
                    items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                    shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                    paymentMethod: 'bank_transfer',
                    totalAmount: 100,
                    status: 'pending'
                });
                orders.push(order);
            }

            // Create test image
            const testImagePath = path.join(__dirname, '../fixtures/rate-limit-test.jpg');
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
            fs.writeFileSync(testImagePath, jpegBuffer);

            // Upload to first 5 orders - should succeed
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post(`/api/orders/${orders[i]._id}/receipt`)
                    .attach('receipt', testImagePath)
                    .expect(200);
            }

            // 6th upload - should hit rate limit
            const res = await request(app)
                .post(`/api/orders/${orders[5]._id}/receipt`)
                .attach('receipt', testImagePath)
                .expect(429);

            expect(res.body.error).toMatch(/too many/i);

            // Cleanup
            fs.unlinkSync(testImagePath);
        }, 30000); // Increase timeout for this test
    });

    describe('Test 7: Private File Access Control', () => {
        it('should deny access to receipt without authentication', async () => {
            const order = await Order.create({
                items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
                shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
                paymentMethod: 'bank_transfer',
                totalAmount: 100,
                status: 'receipt_submitted',
                paymentProof: 'uploads/test-receipt.jpg'
            });

            const res = await request(app)
                .get(`/api/orders/${order._id}/receipt`)
                .expect(401);

            expect(res.body.error).toMatch(/not authorized|unauthorized/i);
        });

        // Note: Testing authenticated access requires JWT token generation
        // which should be implemented in a separate auth test suite
    });
});

describe('Security Logging', () => {
    it('should log failed approval attempts', async () => {
        const order = await Order.create({
            items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }],
            shippingAddress: { name: 'Test', address: '123 St', city: 'City', country: 'PK' },
            paymentMethod: 'bank_transfer',
            totalAmount: 100,
            status: 'receipt_submitted',
            approvalToken: 'valid-token',
            approvalTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        // Attempt with wrong token - should be logged
        await request(app)
            .get(`/api/orders/${order._id}/approve?token=wrong-token`)
            .expect(403);

        // Check logs (implementation depends on your logger)
        // This is a placeholder - actual implementation would check log files or database
    });
});
