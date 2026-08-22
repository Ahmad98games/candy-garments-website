const { supabase } = require('../utils/supabase/server');
const logger = require('./logger');

/**
 * Singleton Database Service for Supabase
 */
async function connect() {
    logger.info('Supabase Client Initialized');
    return supabase;
}

async function disconnect() {
    logger.info('Supabase Client Disconnected');
}

function isReady() {
    return !!supabase;
}

module.exports = {
    connect,
    disconnect,
    isReady,
    supabase
};

