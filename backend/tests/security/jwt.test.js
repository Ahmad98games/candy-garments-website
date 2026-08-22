/**
 * JWT Secret Security Test
 * Validates that JWT secrets meet cryptographic strength requirements
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

describe('JWT Secret Security', () => {
    describe('JWT_SECRET strength validation', () => {
        const secret = process.env.JWT_SECRET || '';

        it('should exist', () => {
            expect(secret).toBeTruthy();
            expect(secret).not.toBe('your-super-secret-jwt-key-change-in-production');
        });

        it('should be at least 32 characters long', () => {
            expect(secret.length).toBeGreaterThanOrEqual(32);
        });

        it('should contain uppercase letters', () => {
            expect(/[A-Z]/.test(secret)).toBe(true);
        });

        it('should contain lowercase letters', () => {
            expect(/[a-z]/.test(secret)).toBe(true);
        });

        it('should contain numbers', () => {
            expect(/[0-9]/.test(secret)).toBe(true);
        });

        it('should contain special characters or symbols', () => {
            // Base64 uses +, /, = as special chars
            expect(/[^A-Za-z0-9]/.test(secret)).toBe(true);
        });
    });

    describe('JWT_REFRESH_SECRET strength validation', () => {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || '';

        it('should exist', () => {
            expect(refreshSecret).toBeTruthy();
            expect(refreshSecret).not.toBe('your-refresh-secret-key');
        });

        it('should be at least 32 characters long', () => {
            expect(refreshSecret.length).toBeGreaterThanOrEqual(32);
        });

        it('should be different from JWT_SECRET', () => {
            expect(refreshSecret).not.toBe(process.env.JWT_SECRET);
        });

        it('should contain uppercase letters', () => {
            expect(/[A-Z]/.test(refreshSecret)).toBe(true);
        });

        it('should contain lowercase letters', () => {
            expect(/[a-z]/.test(refreshSecret)).toBe(true);
        });

        it('should contain numbers', () => {
            expect(/[0-9]/.test(refreshSecret)).toBe(true);
        });

        it('should contain special characters or symbols', () => {
            expect(/[^A-Za-z0-9]/.test(refreshSecret)).toBe(true);
        });
    });

    describe('Secret entropy check', () => {
        it('JWT_SECRET should have high entropy (not predictable)', () => {
            const secret = process.env.JWT_SECRET || '';

            // Check it's not a common weak pattern
            const weakPatterns = [
                'abcd1234',
                '12345678',
                'password',
                'secret',
                'test',
                'admin',
                'qwerty'
            ];

            weakPatterns.forEach(pattern => {
                expect(secret.toLowerCase()).not.toContain(pattern);
            });
        });

        it('JWT_REFRESH_SECRET should have high entropy', () => {
            const refreshSecret = process.env.JWT_REFRESH_SECRET || '';

            const weakPatterns = [
                'abcd1234',
                '12345678',
                'password',
                'secret',
                'test',
                'admin',
                'qwerty'
            ];

            weakPatterns.forEach(pattern => {
                expect(refreshSecret.toLowerCase()).not.toContain(pattern);
            });
        });
    });
});
