const EventEmitter = require('events');
const logger = require('./logger');

/**
 * SYSTEM_STATE Constants
 */
const LIFECYCLE = {
    BOOTING: 'BOOTING',
    READY: 'READY',
    DEGRADED: 'DEGRADED',
    DRAINING: 'DRAINING',
    TERMINATED: 'TERMINATED'
};

const INFRA = {
    DB: 'db',
    REDIS: 'redis'
};

/**
 * SystemState Manager
 * 
 * Enforces strict mutation authority and immutable read models.
 */
class SystemStateManager extends EventEmitter {
    constructor() {
        super();
        this._stateVersion = 0;
        this._lifecycle = LIFECYCLE.BOOTING;
        this._infra = {
            [INFRA.DB]: false,
            [INFRA.REDIS]: false
        };
        this._snapshotCache = new Map();
        this._maxSnapshots = 10; // Pruning threshold

        // Cumulative Telemetry & Aggregation
        this._lastAlertTime = 0;
        this._errorCount = 0;
        this._errorWindowMs = 60000; // 1 minute aggregation window
        this._criticalThreshold = parseInt(process.env.STATE_CRITICAL_THRESHOLD) || 50;
    }

    /**
     * READ MODEL: Immutable Snapshot
     * Memoized per state version.
     */
    getSnapshot() {
        if (this._snapshotCache.has(this._stateVersion)) {
            return this._snapshotCache.get(this._stateVersion);
        }

        const snapshot = Object.freeze({
            version: this._stateVersion,
            lifecycle: this._lifecycle,
            infra: Object.freeze({ ...this._infra }),
            isReady: this._lifecycle === LIFECYCLE.READY || this._lifecycle === LIFECYCLE.DEGRADED,
            timestamp: new Date().toISOString()
        });

        // Pruning logic to prevent memory growth
        if (this._snapshotCache.size >= this._maxSnapshots) {
            const oldestVersion = Math.min(...this._snapshotCache.keys());
            this._snapshotCache.delete(oldestVersion);
        }

        this._snapshotCache.set(this._stateVersion, snapshot);
        return snapshot;
    }

    /**
     * MUTATION AUTHORITY: Infrastructure Status
     * Reserved for bootstrap and health monitors.
     */
    setInfraStatus(service, isAvailable) {
        if (!Object.values(INFRA).includes(service)) {
            logger.error('SYSTEM_STATE: Attempted to set status for unknown service', { service });
            return;
        }

        if (this._infra[service] === isAvailable) return;

        this._infra[service] = isAvailable;
        this._incrementVersion();

        logger.info(`SYSTEM_STATE: ${service.toUpperCase()} status changed`, {
            isAvailable,
            version: this._stateVersion
        });

        this._emitStateChange();
    }

    /**
     * MUTATION AUTHORITY: Lifecycle Transition
     */
    setLifecycle(newState) {
        if (!Object.values(LIFECYCLE).includes(newState)) {
            logger.error('SYSTEM_STATE: Invalid lifecycle transition', { newState });
            return;
        }

        if (this._lifecycle === newState) return;

        const oldState = this._lifecycle;
        this._lifecycle = newState;
        this._incrementVersion();

        logger.info(`SYSTEM_STATE: Lifecycle transition: ${oldState} -> ${newState}`, {
            version: this._stateVersion
        });

        this._emitStateChange();
    }

    _incrementVersion() {
        this._stateVersion++;
    }

    /**
     * Non-blocking, isolated event emission.
     */
    _emitStateChange() {
        const snapshot = this.getSnapshot();

        setImmediate(() => {
            try {
                this.emit('SYSTEM_STATE_CHANGE', snapshot);
            } catch (err) {
                this._handleObserverError(err);
            }
        });
    }

    _handleObserverError(err) {
        this._errorCount++;
        const now = Date.now();

        // High-fidelity logging for every failure (Environment-Aware)
        if (process.env.NODE_ENV === 'production' || this._errorCount % 10 === 0) {
            logger.error('SYSTEM_STATE: Observer failure', {
                error: err.message,
                stack: err.stack,
                cumulativeCount: this._errorCount
            });
        }

        // Aggregated Alerting (prevent alert fatigue)
        if (now - this._lastAlertTime > this._errorWindowMs) {
            this._lastAlertTime = now;

            // Emit high-level alert for monitoring systems
            this.emit('OBSERVER_CRITICAL_LOST', {
                cumulativeCount: this._errorCount,
                threshold: this._criticalThreshold,
                lastError: err.message
            });

            // SLA Breach Logic
            if (this._errorCount >= this._criticalThreshold) {
                logger.error('SYSTEM_STATE: OBSERVER_SLA_BREACH', {
                    totalFailures: this._errorCount,
                    threshold: this._criticalThreshold
                });
                this.emit('SLA_BREACH', {
                    type: 'OBSERVER_FAILURES',
                    count: this._errorCount
                });
            }
        }
    }

    // Helper for readiness check
    isReady() {
        return (this._lifecycle === LIFECYCLE.READY || this._lifecycle === LIFECYCLE.DEGRADED) &&
            this._infra[INFRA.DB];
    }
}

// Singleton export
module.exports = new SystemStateManager();
module.exports.LIFECYCLE = LIFECYCLE;
module.exports.INFRA = INFRA;
