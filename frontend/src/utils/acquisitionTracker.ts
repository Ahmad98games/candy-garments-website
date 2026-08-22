/**
 * Acquisition Channel Tracking Utility
 * Detects UTM parameters or referrer source on first visit and persists channel.
 */

const STORAGE_KEY = 'omnora_acquisition_channel';

export function detectAndSaveAcquisitionChannel(): string {
    if (typeof window === 'undefined') return 'Direct';

    // 1. Check if already stored for this visitor session
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = (urlParams.get('utm_source') || '').toLowerCase();
    const utmMedium = (urlParams.get('utm_medium') || '').toLowerCase();
    const referrer = (document.referrer || '').toLowerCase();

    let channel = 'Direct';

    if (utmSource.includes('instagram') || referrer.includes('instagram.com')) {
        channel = 'Instagram';
    } else if (utmSource.includes('facebook') || utmMedium.includes('facebook') || referrer.includes('facebook.com')) {
        channel = 'Facebook';
    } else if (utmSource.includes('google') || utmMedium.includes('cpc') || referrer.includes('google.com')) {
        channel = 'Google';
    } else if (utmSource.includes('tiktok') || referrer.includes('tiktok.com')) {
        channel = 'TikTok';
    } else if (utmSource.includes('youtube') || referrer.includes('youtube.com')) {
        channel = 'YouTube';
    } else if (referrer && !referrer.includes(window.location.hostname)) {
        channel = 'Referral';
    }

    try {
        localStorage.setItem(STORAGE_KEY, channel);
    } catch (e) {
        // Ignore quota errors
    }

    return channel;
}

export function getStoredAcquisitionChannel(): string {
    if (typeof window === 'undefined') return 'Direct';
    return localStorage.getItem(STORAGE_KEY) || detectAndSaveAcquisitionChannel();
}
