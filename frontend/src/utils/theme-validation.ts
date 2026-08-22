/**
 * Theme & Schema Validation Engine
 * Enforces WCAG AA contrast (>=4.5:1), font pair existence, radius scale enums,
 * and 3:4 aspect ratio locks for production theme settings.
 */

export interface FontPairRef {
    id: string;
    label: string;
}

export interface ValidationThemePayload {
    canvas_bg: string;
    surface_bg?: string;
    card_bg: string;
    accent_primary: string;
    accent_secondary: string;
    font_pair_id: string;
    radius_scale: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return null;
    const fullHex = cleanHex.length === 3
        ? cleanHex.split('').map(c => c + c).join('')
        : cleanHex;
    const num = parseInt(fullHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

export function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

const VALID_RADIUS_SCALES = new Set(['sharp', 'soft', 'rounded']);

export function validateTheme(
    payload: ValidationThemePayload,
    availableFontPairs: FontPairRef[],
    textPrimaryHex = '#F0F6FC'
): ValidationResult {
    const errors: string[] = [];

    // 1. WCAG AA CONTRAST VALIDATION (>= 4.5:1)
    const contrastCanvas = getContrastRatio(textPrimaryHex, payload.canvas_bg);
    if (contrastCanvas < 4.5) {
        errors.push(`WCAG AA violation: text_primary (${textPrimaryHex}) against canvas_bg (${payload.canvas_bg}) ratio is ${contrastCanvas.toFixed(2)}:1 (minimum 4.5:1 required).`);
    }

    const contrastCard = getContrastRatio(textPrimaryHex, payload.card_bg);
    if (contrastCard < 4.5) {
        errors.push(`WCAG AA violation: text_primary (${textPrimaryHex}) against card_bg (${payload.card_bg}) ratio is ${contrastCard.toFixed(2)}:1 (minimum 4.5:1 required).`);
    }

    // 2. FONT PAIR EXISTENCE VALIDATION
    const fontExists = availableFontPairs.some((f) => f.id === payload.font_pair_id);
    if (!fontExists) {
        errors.push(`Orphaned Font Pair: font_pair_id "${payload.font_pair_id}" does not exist in seed font_pairs table.`);
    }

    // 3. RADIUS SCALE ENUM VALIDATION
    if (!VALID_RADIUS_SCALES.has(payload.radius_scale)) {
        errors.push(`Invalid Radius Scale: "${payload.radius_scale}". Must be one of: sharp, soft, rounded.`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validates image width and height ratio before row save when image_aspect_locked = true
 */
export function validateImageAspectRatio(
    width: number,
    height: number,
    targetAspect = 3 / 4,
    tolerance = 0.02
): boolean {
    if (!width || !height || height === 0) return false;
    const actualAspect = width / height;
    return Math.abs(actualAspect - targetAspect) <= tolerance;
}
