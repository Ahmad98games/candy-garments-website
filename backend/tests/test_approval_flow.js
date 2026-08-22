const mongoose = require('mongoose');
const Order = require('../models/Order');
const { createOrder, approveOrder, rejectOrder } = require('../controllers/orderController');
const httpMocks = require('node-mocks-http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
    try {
        // Connect to Local DB for testing
        // Use a test database to avoid messing with production/dev data
        const uri = 'mongodb://127.0.0.1:27017/test_approval_flow_db';
        await mongoose.connect(uri);
        console.log('Connected to Local DB');

        // Clean up previous test data
        await Order.deleteMany({ 'guestCustomer.email': { $in: ['test@example.com', 'test2@example.com'] } });

        // 1. Test Create Order (Non-COD)
        console.log('\n--- Testing Create Order (Bank Transfer) ---');
        let req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/orders',
            body: {
                items: [{ product: '64f8a1b2c3d4e5f6a7b8c9d0', name: 'Test Product', price: 1000, quantity: 1 }],
                shippingAddress: { name: 'Test User', address: '123 Test St', city: 'Test City', country: 'Pakistan', phone: '923001234567' },
                paymentMethod: 'bank_transfer',
                totalAmount: 1000,
                customerInfo: { name: 'Test User', email: 'test@example.com', phone: '923001234567' }
            }
        });
        let res = httpMocks.createResponse();

        await createOrder(req, res);
        const data = res._getJSONData();
        console.log('Create Order Response:', data.success ? 'Success' : 'Failed');

        if (!data.success) {
            console.error('Order creation failed:', data);
            process.exit(1);
        }

        const orderId = data.order._id;
        const order = await Order.findById(orderId);
        console.log('Order created with ID:', orderId);
        console.log('Approval Token present:', !!order.approvalToken);
        console.log('Status:', order.status);

        if (!order.approvalToken) {
            console.error('❌ Approval token missing!');
        } else {
            console.log('✅ Approval token generated.');
        }

        // 2. Test Approve Order
        console.log('\n--- Testing Approve Order ---');
        req = httpMocks.createRequest({
            method: 'GET',
            url: `/api/orders/${orderId}/approve`,
            params: { id: orderId },
            query: { token: order.approvalToken }
        });
        res = httpMocks.createResponse();

        await approveOrder(req, res);
        const approveData = res._getData(); // It sends HTML/String
        console.log('Approve Response:', approveData.includes('Approved') ? 'Success' : 'Failed');

        const updatedOrder = await Order.findById(orderId);
        console.log('Updated Status:', updatedOrder.status);
        console.log('Is Approved:', updatedOrder.isApproved);

        if (updatedOrder.status === 'approved' && updatedOrder.isApproved) {
            console.log('✅ Order approved successfully.');
        } else {
            console.error('❌ Order approval failed.');
        }

        // 3. Test Reject Order (Create another order first)
        console.log('\n--- Testing Reject Order ---');
        // Create another order
        req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/orders',
            body: {
                items: [{ product: '64f8a1b2c3d4e5f6a7b8c9d0', name: 'Test Product 2', price: 2000, quantity: 1 }],
                shippingAddress: { name: 'Test User 2', address: '123 Test St', city: 'Test City', country: 'Pakistan', phone: '923001234567' },
                paymentMethod: 'bank_transfer',
                totalAmount: 2000,
                customerInfo: { name: 'Test User 2', email: 'test2@example.com', phone: '923001234567' }
            }
        });
        res = httpMocks.createResponse();
        await createOrder(req, res);
        const data2 = res._getJSONData();
        const orderId2 = data2.order._id;
        const order2 = await Order.findById(orderId2);

        // Reject it
        req = httpMocks.createRequest({
            method: 'GET',
            url: `/api/orders/${orderId2}/reject`,
            params: { id: orderId2 },
            query: { token: order2.approvalToken }
        });
        res = httpMocks.createResponse();

        await rejectOrder(req, res);
        const rejectData = res._getData();
        console.log('Reject Response:', rejectData.includes('Rejected') ? 'Success' : 'Failed');

        const rejectedOrder = await Order.findById(orderId2);
        console.log('Rejected Status:', rejectedOrder.status);

        if (rejectedOrder.status === 'rejected') {
            console.log('✅ Order rejected successfully.');
        } else {
            console.error('❌ Order rejection failed.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

runTest();
