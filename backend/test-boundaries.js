const axios = require('axios');
const assert = require('assert');
const express = require('express');
const stateService = require('./services/stateService');
const { LIFECYCLE, INFRA } = require('./services/stateService');
const { gatekeeper, CAPABILITIES } = require('./middleware/gatekeeper');

/**
 * BOUNDARY TEST SUITE (AXIOS Fallback)
 * 
 * Verifies ironclad operational gating, versioning, and lifecycle invariants.
 */
async function runTests() {
    console.log('\n🚀 STARTING BOUNDARY INVARIANT TESTS (AXIOS)\n');

    // Setup Test App
    const app = express();
    app.use(express.json());

    // Mock Routes
    app.get('/api/test/read', gatekeeper(CAPABILITIES.READ_ONLY), (req, res) => res.status(200).json({ data: 'ok' }));
    app.post('/api/test/mutate', gatekeeper(CAPABILITIES.STATE_MUTATING), (req, res) => res.status(201).json({ data: 'saved' }));

    // Start Server on random port
    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    const V1_HEADER = { 'x-api-version': '1' };

    try {
        // --- SCENARIO 1: ALL SYSTEMS GO ---
        console.log('--- Scenario 1: Ready State ---');
        stateService.setInfraStatus(INFRA.DB, true);
        stateService.setLifecycle(LIFECYCLE.READY);

        const res1 = await axios.get(`${baseUrl}/api/test/read`, { headers: V1_HEADER });
        console.log('✅ Read allowed in READY');
        assert.strictEqual(res1.status, 200);

        const res2 = await axios.post(`${baseUrl}/api/test/mutate`, {}, { headers: V1_HEADER });
        console.log('✅ Mutate allowed in READY');
        assert.strictEqual(res2.status, 201);

        // --- SCENARIO 2: DEGRADED MODE (DB DOWN) ---
        console.log('\n--- Scenario 2: Degraded State (DB Down) ---');
        stateService.setInfraStatus(INFRA.DB, false);
        stateService.setLifecycle(LIFECYCLE.DEGRADED);

        const res3 = await axios.get(`${baseUrl}/api/test/read`, { headers: V1_HEADER });
        console.log('✅ Read allowed in DEGRADED');
        assert.strictEqual(res3.status, 200);

        try {
            await axios.post(`${baseUrl}/api/test/mutate`, {}, { headers: V1_HEADER });
            console.error('❌ FAIL: Mutate should be blocked in DEGRADED');
            process.exit(1);
        } catch (err) {
            console.log('✅ Mutate BLOCKED in DEGRADED (503)');
            assert.strictEqual(err.response.status, 503);
            assert.strictEqual(err.response.data.v, 1);
            assert.strictEqual(err.response.data.error, 'SERVICE_UNAVAILABLE');
            assert.ok(err.response.data.blocking.includes('DB'));
        }

        // --- SCENARIO 3: VERSION ENFORCEMENT ---
        console.log('\n--- Scenario 3: Version Enforcement ---');
        try {
            await axios.get(`${baseUrl}/api/test/read`); // No version header
            console.error('❌ FAIL: Missing version header should be blocked');
            process.exit(1);
        } catch (err) {
            console.log('✅ Missing version header BLOCKED (400)');
            assert.strictEqual(err.response.status, 400);
            assert.strictEqual(err.response.data.error, 'INVALID_API_VERSION');
        }

        // --- SCENARIO 4: DRAINING STATE ---
        console.log('\n--- Scenario 4: Draining State ---');
        stateService.setLifecycle(LIFECYCLE.DRAINING);

        const res6 = await axios.get(`${baseUrl}/api/test/read`, { headers: V1_HEADER });
        console.log('✅ Read allowed in DRAINING');
        assert.strictEqual(res6.status, 200);

        try {
            await axios.post(`${baseUrl}/api/test/mutate`, {}, { headers: V1_HEADER });
            console.error('❌ FAIL: Mutate should be blocked in DRAINING');
            process.exit(1);
        } catch (err) {
            console.log('✅ Mutate BLOCKED in DRAINING (503)');
            assert.strictEqual(err.response.status, 503);
        }

        // --- SCENARIO 5: PRODUCTION GUARD ---
        console.log('\n--- Scenario 5: Production Guard ---');
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        try {
            gatekeeper(CAPABILITIES.INTERNAL_ONLY);
            console.error('❌ FAIL: gatekeeper(INTERNAL_ONLY) should throw in production');
            process.exit(1);
        } catch (err) {
            console.log('✅ gatekeeper(INTERNAL_ONLY) threw error in production as expected');
            assert.ok(err.message.includes('GATEKEEPER_SECURITY_VIOLATION'));
        }
        process.env.NODE_ENV = originalEnv;

        console.log('\n🎯 ALL BOUNDARY TESTS PASSED SUCCESSFULLY\n');
        server.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ TEST SUITE FAILED:', err.message);
        server.close();
        process.exit(1);
    }
}

runTests();
