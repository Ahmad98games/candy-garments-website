/**
 * PII Sanitizer & Masking Utility
 * Ensures customer phone numbers and street addresses are never logged in plaintext.
 */

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return 'N/A';
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length <= 4) return '****';
  return cleaned.slice(0, 3) + ' **** ' + cleaned.slice(-4);
}

function maskAddress(address, city) {
  if (city) return `[REDACTED STREET], ${city}`;
  if (!address || typeof address !== 'string') return 'N/A';
  return '[REDACTED STREET ADDRESS]';
}

function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(clone)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('phone')) {
      clone[key] = maskPhone(clone[key]);
    } else if (
      lowerKey.includes('address') &&
      !lowerKey.includes('city') &&
      !lowerKey.includes('pinlat') &&
      !lowerKey.includes('pinlng') &&
      !lowerKey.includes('address_pin')
    ) {
      clone[key] = maskAddress(clone[key], clone.shippingCity || clone.city || clone.shipping_city);
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitizePayload(clone[key]);
    }
  }

  return clone;
}

module.exports = {
  maskPhone,
  maskAddress,
  sanitizePayload,
};
