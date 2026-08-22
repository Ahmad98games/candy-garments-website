#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Order Approval System
 * Run: node scripts/test-approval-system.js
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateApprovalToken, verifyApprovalToken } = require('../utils/tokenService');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_ORDER_ID = '507f1f77bcf86cd799439011';

console.log('\n🧪 ORDER APPROVAL SYSTEM - COMPREHENSIVE TEST SUITE\n');
console.log('='.repeat(70));

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
    if (passed) {
        console.log(`✅ PASS: ${name}`);
        testsPassed++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        if (details) console.log(`   Details: ${details}`);
        testsFailed++;
    }
}

async function runTests() {

    // ============================================
    // 1. TOKEN SECURITY TESTS
    // ============================================
    console.log('\n📋 1. TOKEN SECURITY TESTS\n');

    // Test 1.1: Valid token generation and verification
    try {
        const token = generateApprovalToken(TEST_ORDER_ID, 'approve', 'admin@test.com', '127.0.0.1');
        const decoded = verifyApprovalToken(token, TEST_ORDER_ID);
        logTest('Valid token generation and verification', decoded && decoded.orderId === TEST_ORDER_ID);
    } catch (error) {
        logTest('Valid token generation and verification', false, error.message);
    }

    // Test 1.2: Tampered token rejection
    try {
        const token = generateApprovalToken(TEST_ORDER_ID, 'approve', 'admin@test.com', '127.0.0.1');
        const tamperedToken = token.slice(0, -10) + 'XXXXXXXXXX';
        const decoded = verifyApprovalToken(tamperedToken, TEST_ORDER_ID);
        logTest('Tampered token rejection', !decoded);
    } catch (error) {
        logTest('Tampered token rejection', false, error.message);
    }

    // Test 1.3: Wrong order ID in token
    try {
        const token = generateApprovalToken(TEST_ORDER_ID, 'approve', 'admin@test.com', '127.0.0.1');
        const wrongOrderId = '507f1f77bcf86cd799439012';
        const decoded = verifyApprovalToken(token, wrongOrderId);
        logTest('Wrong order ID rejection', !decoded);
    } catch (error) {
        logTest('Wrong order ID rejection', false, error.message);
    }

    // Test 1.4: Admin binding verification
    try {
        const adminEmail = 'admin@omnora.com';
        const token = generateApprovalToken(TEST_ORDER_ID, 'approve', adminEmail, '192.168.1.1');
        const decoded = verifyApprovalToken(token, TEST_ORDER_ID);
        logTest('Admin binding in token', decoded && decoded.adminEmail === adminEmail && decoded.adminIp === '192.168.1.1');
    } catch (error) {
        logTest('Admin binding in token', false, error.message);
    }

    // Test 1.5: Unique JTI (JWT ID) generation
    try {
        const token1 = generateApprovalToken(TEST_ORDER_ID, 'approve', 'admin@test.com', '127.0.0.1');
        const token2 = generateApprovalToken(TEST_ORDER_ID, 'approve', 'admin@test.com', '127.0.0.1');
        const decoded1 = verifyApprovalToken(token1, TEST_ORDER_ID);
        const decoded2 = verifyApprovalToken(token2, TEST_ORDER_ID);
        logTest('Unique JTI generation', decoded1.jti !== decoded2.jti);
    } catch (error) {
        logTest('Unique JTI generation', false, error.message);
    }

    // ============================================
    // 2. HTTP ENDPOINT TESTS (if server running)
    // ============================================
    console.log('\n📋 2. HTTP ENDPOINT TESTS\n');

    try {
        // Test 2.1: Invalid token returns 400
        try {
            const response = await axios.get(`${BASE_URL}/api/orders/${TEST_ORDER_ID}/approve?token=invalid_token`, {
                validateStatus: () => true
            });
            logTest('Invalid token returns 400', response.status === 400);
        } catch (error) {
            logTest('Invalid token returns 400', false, 'Server not running or endpoint not accessible');
        }

        // Test 2.2: Missing token returns 400
        try {
            const response = await axios.get(`${BASE_URL}/api/orders/${TEST_ORDER_ID}/approve`, {
                validateStatus: () => true
            });
            logTest('Missing token returns 400', response.status === 400);
        } catch (error) {
            logTest('Missing token returns 400', false, 'Server not running');
        }

    } catch (error) {
        console.log('⚠️  HTTP tests skipped - server not running');
    }

    // ============================================
    // 3. IDEMPOTENCY TESTS
    // ============================================
    console.log('\n📋 3. IDEMPOTENCY TESTS\n');

    console.log('⚠️  Idempotency tests require manual verification:');
    console.log('   1. Approve an order');
    console.log('   2. Click approve link again');
    console.log('   3. Verify 409 Conflict response');
    console.log('   4. Verify NO duplicate WhatsApp message sent');

    // ============================================
    // 4. SECURITY CHECKLIST
    // ============================================
    console.log('\n📋 4. SECURITY CHECKLIST\n');

    const securityChecks = [
        { name: 'APPROVAL_TOKEN_SECRET set', check: !!process.env.APPROVAL_TOKEN_SECRET },
        { name: 'Token secret length >= 32', check: process.env.APPROVAL_TOKEN_SECRET?.length >= 32 },
        { name: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN set', check: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN },
        { name: 'ADMIN_EMAIL configured', check: !!process.env.ADMIN_EMAIL },
        { name: 'BACKEND_URL configured', check: !!process.env.BACKEND_URL }
    ];

    securityChecks.forEach(({ name, check }) => {
        logTest(name, check);
    });

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 TEST SUMMARY\n');
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    if (testsFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! System is ready for production.\n');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED. Review failures before deploying.\n');
    }

    // ============================================
    // MANUAL TEST INSTRUCTIONS
    // ============================================
    console.log('📝 MANUAL TESTS REQUIRED:\n');
    console.log('1. Token Replay Test:');
    console.log('   - Approve order → click approve again → expect 409');
    console.log('\n2. WhatsApp Failure Test:');
    console.log('   - Set invalid WHATSAPP_CLOUD_API_TOKEN');
    console.log('   - Approve order → check logs for retry/DLQ');
    console.log('\n3. Email Fallback Test:');
    console.log('   - Simulate SendGrid 5xx → verify SMTP fallback');
    console.log('\n4. Load Test:');
    console.log('   - Burst 100 approval requests → verify rate limiting');
    console.log('\n5. Admin Identity Test:');
    console.log('   - Wrong admin clicks link → verify 403 (future feature)');
    console.log('');
}

runTests().catch(console.error);
