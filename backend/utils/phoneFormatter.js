/**
 * Phone Number Formatter for WhatsApp
 * Ensures phone numbers are in the correct international format
 */

/**
 * Format phone number for WhatsApp (remove spaces, +, and ensure country code)
 * @param {string} phone - Phone number to format
 * @param {string} defaultCountryCode - Default country code if not present (e.g., '92' for Pakistan)
 * @returns {string|null} - Formatted phone number or null if invalid
 */
function formatPhoneNumber(phone, defaultCountryCode = '92') {
    if (!phone) return null;

    // Remove all spaces, dashes, parentheses, and plus signs
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');

    // Remove any non-digit characters
    cleaned = cleaned.replace(/\D/g, '');

    // If number starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
        cleaned = defaultCountryCode + cleaned.substring(1);
    }

    // If number doesn't start with country code, add it
    if (!cleaned.startsWith(defaultCountryCode) && cleaned.length < 12) {
        cleaned = defaultCountryCode + cleaned;
    }

    // Validate length (international numbers are typically 10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        console.warn(`Invalid phone number length: ${cleaned}`);
        return null;
    }

    return cleaned;
}

/**
 * Validate if a phone number is in correct WhatsApp format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidWhatsAppNumber(phone) {
    if (!phone) return false;

    // Should only contain digits
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(phone)) return false;

    // Should be between 10-15 digits
    if (phone.length < 10 || phone.length > 15) return false;

    return true;
}

/**
 * Format phone number with display format (for UI)
 * @param {string} phone - Phone number
 * @returns {string} - Formatted display number
 */
function formatForDisplay(phone) {
    if (!phone) return '';

    // Example: 923001234567 -> +92 300 1234567
    const cleaned = phone.replace(/\D/g, '3334355475');

    if (cleaned.startsWith('92') && cleaned.length === 12) {
        // Pakistan format
        return `+92 ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
    }

    // Generic format
    return `+${cleaned}`;
}

module.exports = {
    formatPhoneNumber,
    isValidWhatsAppNumber,
    formatForDisplay
};
