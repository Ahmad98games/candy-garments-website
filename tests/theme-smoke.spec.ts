import { test, expect } from '@playwright/test';

/**
 * Playwright Smoke & Visual Regression Test Suite
 * Tests 6 curated theme presets across 3 catalog scales (1, 12, and 120 products)
 * Captures screenshot regression artifacts for homepage and collection catalog.
 */

const CURATED_PRESETS = [
    { label: 'Obsidian Emerald', primary: '#10B981', secondary: '#00E5FF' },
    { label: 'Neon Cyber', primary: '#00E5FF', secondary: '#10B981' },
    { label: 'Warm Amber', primary: '#F59E0B', secondary: '#EF4444' },
    { label: 'Royal Amethyst', primary: '#8B5CF6', secondary: '#F59E0B' },
    { label: 'Crimson Flare', primary: '#EF4444', secondary: '#00E5FF' },
    { label: 'Vibrant Lotus', primary: '#EC4899', secondary: '#00E5FF' },
];

const CATALOG_SCALES = [1, 12, 120];

test.describe('Theme System Smoke & Layout Regression Net', () => {

    for (const preset of CURATED_PRESETS) {
        for (const scale of CATALOG_SCALES) {
            test(`Theme Preset [${preset.label}] @ Scale [${scale} products]`, async ({ page }) => {
                // 1. Navigate to Storefront
                await page.goto(`http://localhost:5173/?mockCatalogScale=${scale}`);
                await page.waitForLoadState('networkidle');

                // 2. Inject Theme Tokens
                await page.evaluate((p) => {
                    document.documentElement.style.setProperty('--accent-emerald', p.primary);
                    document.documentElement.style.setProperty('--accent-primary', p.primary);
                    document.documentElement.style.setProperty('--accent-cyan', p.secondary);
                    document.documentElement.style.setProperty('--accent-secondary', p.secondary);
                }, preset);

                // 3. Verify Homepage Layout Elements
                const heroHeadline = page.locator('h1, h2').first();
                await expect(heroHeadline).toBeVisible();

                // Screenshot Homepage
                await page.screenshot({
                    path: `test-results/screenshots/homepage_${preset.label.replace(/\s+/g, '_')}_scale_${scale}.png`,
                    fullPage: false,
                });

                // 4. Navigate to Collection Grid
                await page.goto(`http://localhost:5173/collection?mockCatalogScale=${scale}`);
                await page.waitForLoadState('networkidle');

                // Screenshot Collection Grid
                await page.screenshot({
                    path: `test-results/screenshots/collection_${preset.label.replace(/\s+/g, '_')}_scale_${scale}.png`,
                    fullPage: false,
                });
            });
        }
    }
});
