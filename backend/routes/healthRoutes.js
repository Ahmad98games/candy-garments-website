const express = require('express');
const router = express.Router();
const stateService = require('../services/stateService');
const { LIFECYCLE } = require('../services/stateService');

/**
 * Liveness Probe
 * Minimal heartbeat to confirm process is running.
 */
router.get('/live', (req, res) => {
    const snapshot = stateService.getSnapshot();
    res.status(200).json({
        status: 'ok',
        lifecycle: snapshot.lifecycle,
        timestamp: snapshot.timestamp,
        uptime: process.uptime()
    });
});

/**
 * Readiness Probe
 * Confirms system is ready to handle traffic.
 * Returns 503 if in BOOTING, DRAINING, or DEGRADED (without DB).
 */
router.get('/ready', (req, res) => {
    const snapshot = stateService.getSnapshot();
    const isReady = stateService.isReady();

    if (isReady && snapshot.lifecycle === LIFECYCLE.READY) {
        return res.status(200).json({
            status: 'ready',
            database: snapshot.infra.db ? 'connected' : 'disconnected',
            lifecycle: snapshot.lifecycle
        });
    }

    // Degraded or Not Ready
    res.status(503).json({
        status: isReady ? 'degraded' : 'not_ready',
        database: snapshot.infra.db ? 'connected' : 'disconnected',
        lifecycle: snapshot.lifecycle,
        retryable: snapshot.lifecycle !== LIFECYCLE.TERMINATED
    });
});

// Legacy /health endpoint
router.get('/health', (req, res) => {
    const snapshot = stateService.getSnapshot();
    res.status(200).json({
        status: snapshot.isReady ? 'ok' : 'degraded',
        database: snapshot.infra.db ? 'connected' : 'disconnected',
        lifecycle: snapshot.lifecycle,
    });
});

// Root handler for /api/health
router.get('/', (req, res) => {
    const snapshot = stateService.getSnapshot();
    res.status(200).json({
        status: snapshot.isReady ? 'ok' : 'degraded',
        database: snapshot.infra.db ? 'connected' : 'disconnected',
        lifecycle: snapshot.lifecycle,
        uptime: process.uptime()
    });
});

module.exports = router;
