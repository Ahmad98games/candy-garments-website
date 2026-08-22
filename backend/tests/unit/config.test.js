const { validateEnv, ERRORS } = require('../../config/env');

describe('Config Unit Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should throw ERR_ENV_MISSING_CRITICAL_SECRET if JWT_SECRET is missing', () => {
        delete process.env.JWT_SECRET;

        try {
            validateEnv();
            fail('Should have thrown an error');
        } catch (error) {
            expect(error.code).toBe(ERRORS.MISSING_SECRET);
            expect(error.message).toMatch(/JWT_SECRET is missing/);
        }
    });

    it('should throw ERR_ENV_MISSING_CRITICAL_SECRET if MONGODB_URI is missing', () => {
        delete process.env.MONGODB_URI;

        try {
            validateEnv();
            fail('Should have thrown an error');
        } catch (error) {
            expect(error.code).toBe(ERRORS.MISSING_SECRET);
            expect(error.message).toMatch(/MONGO.URI is missing/);
        }
    });

    it('should successfully validate with required environment variables', () => {
        process.env.JWT_SECRET = 'test-secret';
        process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

        const config = validateEnv();
        expect(config.jwt.secret).toBe('test-secret');
        expect(config.mongo.uri).toBe('mongodb://localhost:27017/test');
    });
});
