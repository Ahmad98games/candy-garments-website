const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('./logger');

let mongoServer = null;

/**
 * In-Memory MongoDB Service
 * 
 * Provides a temporary MongoDB instance for development/testing.
 * Data is NOT persistent and will be lost when the server stops.
 */

async function startInMemoryMongo() {
    if (mongoServer) {
        return mongoServer.getUri();
    }

    try {
        logger.info('Starting in-memory MongoDB server...');

        mongoServer = await MongoMemoryServer.create({
            instance: {
                dbName: 'omnora',
                port: 27018, // Use different port to avoid conflicts
            },
        });

        const uri = mongoServer.getUri();
        logger.info('In-memory MongoDB started successfully', {
            uri: uri,
            dbName: 'omnora',
            warning: 'DATA WILL NOT PERSIST AFTER RESTART'
        });

        return uri;
    } catch (error) {
        logger.error('Failed to start in-memory MongoDB', { error: error.message });
        throw error;
    }
}

async function stopInMemoryMongo() {
    if (mongoServer) {
        logger.info('Stopping in-memory MongoDB server...');
        await mongoServer.stop();
        mongoServer = null;
        logger.info('In-memory MongoDB stopped');
    }
}

module.exports = {
    startInMemoryMongo,
    stopInMemoryMongo
};
