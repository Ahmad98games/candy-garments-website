import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================================
// 1. CURATED PALETTE & TRIAD DEFINITIONS (Guardrails)
// ============================================================================

export const CURATED_ACCENTS = [
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Cyan', hex: '#00E5FF' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Crimson', hex: '#EF4444' },
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Pink', hex: '#EC4899' },
    { label: 'Blue', hex: '#3B82F6' },
] as const;

export type RadiusScale = 'sharp' | 'soft' | 'rounded';

export const RADIUS_PRESETS: Record<RadiusScale, { sm: string; md: string; lg: string }> = {
    sharp: { sm: '0px', md: '2px', lg: '4px' },
    soft: { sm: '4px', md: '6px', lg: '8px' },
    rounded: { sm: '8px', md: '12px', lg: '16px' },
};

// ============================================================================
// 2. INTERFACES & TYPES
// ============================================================================

export interface FontPair {
    id: string;
    label: string;
    heading_font: string;
    body_font: string;
    mono_font: string;
    preview_swatch_url?: string;
}

export interface ThemeTokens {
    canvas_bg: string;
    surface_bg: string;
    card_bg: string;
    accent_primary: string;
    accent_secondary: string;
    font_pair_id: string;
    radius_scale: RadiusScale;
}

export interface SiteThemeSettings extends ThemeTokens {
    id: string;
    is_published: boolean;
    draft_payload: Partial<ThemeTokens>;
    published_at: string;
    published_by?: string;
}

export interface SiteSocialSettings {
    id: string;
    instagram_url: string;
    facebook_url: string;
    tiktok_url: string;
    youtube_url: string;
    whatsapp_number: string;
    whatsapp_business_message_template: string;
    show_in_header: boolean;
    show_in_footer: boolean;
    show_share_buttons_on_product: boolean;
    show_on_order_confirmation: boolean;
}

interface ThemeContextType {
    theme: ThemeTokens;
    fontPairs: FontPair[];
    activeFontPair: FontPair | undefined;
    socialSettings: SiteSocialSettings | null;
    loading: boolean;
    
    // Draft & Admin Controls
    draftPayload: Partial<ThemeTokens>;
    isDraftModified: boolean;
    updateDraftPayload: (updates: Partial<ThemeTokens>) => void;
    saveDraftPayload: () => Promise<boolean>;
    publishTheme: () => Promise<boolean>;
    resetDraftPayload: () => void;
}

const DEFAULT_THEME_TOKENS: ThemeTokens = {
    canvas_bg: '#060708',
    surface_bg: '#0D1117',
    card_bg: '#161B22',
    accent_primary: '#10B981',
    accent_secondary: '#00E5FF',
    font_pair_id: '00000000-0000-0000-0000-000000000010',
    radius_scale: 'soft',
};

const DEFAULT_FONT_PAIRS: FontPair[] = [
    {
        id: '00000000-0000-0000-0000-000000000010',
        label: 'Obsidian Default',
        heading_font: 'Inter',
        body_font: 'Inter',
        mono_font: 'JetBrains Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000011',
        label: 'Space Tech',
        heading_font: 'Space Grotesk',
        body_font: 'Inter',
        mono_font: 'IBM Plex Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;600&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000012',
        label: 'Sora Clean',
        heading_font: 'Sora',
        body_font: 'Sora',
        mono_font: 'Roboto Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Roboto+Mono:wght@400;600&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000013',
        label: 'General Precision',
        heading_font: 'General Sans',
        body_font: 'Switzer',
        mono_font: 'Fira Code',
        preview_swatch_url: 'https://api.fontshare.com/v2/css?f[]=general-sans@500,700&f[]=switzer@400,500&f[]=fira-code@400,600&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000014',
        label: 'Outfit Modern',
        heading_font: 'Outfit',
        body_font: 'Outfit',
        mono_font: 'JetBrains Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000015',
        label: 'Jakarta Corporate',
        heading_font: 'Plus Jakarta Sans',
        body_font: 'Inter',
        mono_font: 'Space Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&family=Inter:wght@400;500&family=Space+Mono:wght@400;700&display=swap',
    },
    {
        id: '00000000-0000-0000-0000-000000000016',
        label: 'Lexend Minimal',
        heading_font: 'Lexend',
        body_font: 'Lexend',
        mono_font: 'IBM Plex Mono',
        preview_swatch_url: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap',
    },
];

const LOCAL_STORAGE_CACHE_KEY = 'omnora_theme_cache';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// 3. HELPER: DYNAMIC CSS TOKEN INJECTION
// ============================================================================

export function applyThemeToElement(
    tokens: ThemeTokens,
    fontPair?: FontPair,
    targetElement: HTMLElement = document.documentElement
) {
    if (!targetElement) return;

    targetElement.style.setProperty('--bg-canvas', tokens.canvas_bg);
    targetElement.style.setProperty('--bg-surface', tokens.surface_bg);
    targetElement.style.setProperty('--bg-card', tokens.card_bg);
    targetElement.style.setProperty('--accent-emerald', tokens.accent_primary);
    targetElement.style.setProperty('--accent-primary', tokens.accent_primary);
    targetElement.style.setProperty('--accent-cyan', tokens.accent_secondary);
    targetElement.style.setProperty('--accent-secondary', tokens.accent_secondary);

    const radii = RADIUS_PRESETS[tokens.radius_scale] || RADIUS_PRESETS.soft;
    targetElement.style.setProperty('--radius-sm', radii.sm);
    targetElement.style.setProperty('--radius-md', radii.md);
    targetElement.style.setProperty('--radius-lg', radii.lg);

    if (fontPair) {
        targetElement.style.setProperty(
            '--font-main',
            `'${fontPair.body_font}', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`
        );
        targetElement.style.setProperty(
            '--font-serif',
            `'${fontPair.heading_font}', -apple-system, sans-serif`
        );
        targetElement.style.setProperty(
            '--font-mono',
            `'${fontPair.mono_font}', 'Fira Code', monospace`
        );

        if (fontPair.preview_swatch_url && typeof document !== 'undefined') {
            const fontLinkId = `font-pair-${fontPair.id}`;
            if (!document.getElementById(fontLinkId)) {
                const link = document.createElement('link');
                link.id = fontLinkId;
                link.rel = 'stylesheet';
                link.href = fontPair.preview_swatch_url;
                document.head.appendChild(link);
            }
        }
    }
}

// ============================================================================
// 4. THEME PROVIDER COMPONENT
// ============================================================================

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeTokens>(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    applyThemeToElement(parsed);
                    return parsed;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return DEFAULT_THEME_TOKENS;
    });

    const [fontPairs, setFontPairs] = useState<FontPair[]>(DEFAULT_FONT_PAIRS);
    const [socialSettings, setSocialSettings] = useState<SiteSocialSettings | null>(null);
    const [draftPayload, setDraftPayload] = useState<Partial<ThemeTokens>>({});
    const [loading, setLoading] = useState(true);

    const activeFontPair = useMemo(
        () => fontPairs.find((f) => f.id === (draftPayload.font_pair_id || theme.font_pair_id)) || fontPairs[0],
        [fontPairs, draftPayload.font_pair_id, theme.font_pair_id]
    );

    useEffect(() => {
        applyThemeToElement(theme, activeFontPair);
        try {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(theme));
        } catch (e) {
            // Ignore quota errors
        }
    }, [theme, activeFontPair]);

    // 1. FETCH THEME & FONT PAIRS FROM SUPABASE
    const loadThemeFromSupabase = useCallback(async () => {
        try {
            // Fetch font pairs
            const { data: fonts } = await supabase.from('font_pairs').select('*').order('created_at', { ascending: true });
            if (fonts && fonts.length > 0) {
                setFontPairs(fonts as FontPair[]);
            } else {
                // Seed default font pairs if table empty
                await supabase.from('font_pairs').upsert(DEFAULT_FONT_PAIRS);
            }

            // Fetch theme settings
            const { data: themeData } = await supabase
                .from('site_theme_settings')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (themeData) {
                const loadedTokens: ThemeTokens = {
                    canvas_bg: themeData.canvas_bg || DEFAULT_THEME_TOKENS.canvas_bg,
                    surface_bg: themeData.surface_bg || DEFAULT_THEME_TOKENS.surface_bg,
                    card_bg: themeData.card_bg || DEFAULT_THEME_TOKENS.card_bg,
                    accent_primary: themeData.accent_primary || DEFAULT_THEME_TOKENS.accent_primary,
                    accent_secondary: themeData.accent_secondary || DEFAULT_THEME_TOKENS.accent_secondary,
                    font_pair_id: themeData.font_pair_id || DEFAULT_THEME_TOKENS.font_pair_id,
                    radius_scale: themeData.radius_scale || DEFAULT_THEME_TOKENS.radius_scale,
                };
                setTheme(loadedTokens);
                if (themeData.draft_payload && Object.keys(themeData.draft_payload).length > 0) {
                    setDraftPayload(themeData.draft_payload);
                } else {
                    setDraftPayload(loadedTokens);
                }
            }

            // Fetch social settings
            const { data: socialData } = await supabase
                .from('site_social_settings')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000002')
                .single();

            if (socialData) {
                setSocialSettings(socialData as SiteSocialSettings);
            }
        } catch (error) {
            console.warn('Failed to load theme settings from Supabase:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadThemeFromSupabase();

        const channel = supabase
            .channel('site_theme_settings_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_theme_settings',
                    filter: 'id=eq.00000000-0000-0000-0000-000000000001',
                },
                (payload) => {
                    const newRow = payload.new as SiteThemeSettings;
                    if (newRow && newRow.is_published) {
                        const updatedTokens: ThemeTokens = {
                            canvas_bg: newRow.canvas_bg,
                            surface_bg: newRow.surface_bg,
                            card_bg: newRow.card_bg,
                            accent_primary: newRow.accent_primary,
                            accent_secondary: newRow.accent_secondary,
                            font_pair_id: newRow.font_pair_id,
                            radius_scale: newRow.radius_scale,
                        };
                        setTheme(updatedTokens);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadThemeFromSupabase]);

    const isDraftModified = useMemo(() => {
        if (!draftPayload || Object.keys(draftPayload).length === 0) return false;
        return (
            draftPayload.canvas_bg !== theme.canvas_bg ||
            draftPayload.surface_bg !== theme.surface_bg ||
            draftPayload.card_bg !== theme.card_bg ||
            draftPayload.accent_primary !== theme.accent_primary ||
            draftPayload.accent_secondary !== theme.accent_secondary ||
            draftPayload.font_pair_id !== theme.font_pair_id ||
            draftPayload.radius_scale !== theme.radius_scale
        );
    }, [draftPayload, theme]);

    const updateDraftPayload = (updates: Partial<ThemeTokens>) => {
        setDraftPayload((prev) => ({ ...prev, ...updates }));
    };

    const saveDraftPayload = async (): Promise<boolean> => {
        try {
            localStorage.setItem('omnora_draft_theme_cache', JSON.stringify(draftPayload));
        } catch (e) {
            // Ignore quota errors
        }

        try {
            await supabase.from('font_pairs').upsert(DEFAULT_FONT_PAIRS);
            await supabase
                .from('site_theme_settings')
                .upsert([
                    {
                        id: '00000000-0000-0000-0000-000000000001',
                        canvas_bg: draftPayload.canvas_bg || theme.canvas_bg,
                        surface_bg: draftPayload.surface_bg || theme.surface_bg,
                        card_bg: draftPayload.card_bg || theme.card_bg,
                        accent_primary: draftPayload.accent_primary || theme.accent_primary,
                        accent_secondary: draftPayload.accent_secondary || theme.accent_secondary,
                        font_pair_id: draftPayload.font_pair_id || theme.font_pair_id,
                        radius_scale: draftPayload.radius_scale || theme.radius_scale,
                        draft_payload: draftPayload,
                        updated_at: new Date().toISOString(),
                    },
                ]);
        } catch (e) {
            console.warn('Draft save remote persistence note:', e);
        }
        return true;
    };

    const publishTheme = async (): Promise<boolean> => {
        const mergedToPublish: ThemeTokens = {
            canvas_bg: draftPayload.canvas_bg || theme.canvas_bg,
            surface_bg: draftPayload.surface_bg || theme.surface_bg,
            card_bg: draftPayload.card_bg || theme.card_bg,
            accent_primary: draftPayload.accent_primary || theme.accent_primary,
            accent_secondary: draftPayload.accent_secondary || theme.accent_secondary,
            font_pair_id: draftPayload.font_pair_id || theme.font_pair_id,
            radius_scale: draftPayload.radius_scale || theme.radius_scale,
        };

        // 1. Immediately update local react state & DOM CSS variables
        setTheme(mergedToPublish);
        setDraftPayload(mergedToPublish);
        applyThemeToElement(mergedToPublish, activeFontPair);

        try {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(mergedToPublish));
        } catch (e) {
            // Ignore quota errors
        }

        // 2. Persist to Supabase in background
        try {
            await supabase.from('font_pairs').upsert(DEFAULT_FONT_PAIRS);
            const { error } = await supabase
                .from('site_theme_settings')
                .upsert([
                    {
                        id: '00000000-0000-0000-0000-000000000001',
                        ...mergedToPublish,
                        is_published: true,
                        published_at: new Date().toISOString(),
                        draft_payload: mergedToPublish,
                        updated_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                console.warn('Supabase remote theme publish note:', error.message || error);
            }
        } catch (e) {
            console.warn('Remote theme publish sync note:', e);
        }

        return true;
    };

    const resetDraftPayload = () => {
        setDraftPayload(theme);
    };

    const value = {
        theme,
        fontPairs,
        activeFontPair,
        socialSettings,
        loading,
        draftPayload,
        isDraftModified,
        updateDraftPayload,
        saveDraftPayload,
        publishTheme,
        resetDraftPayload,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// ============================================================================
// 5. DRAFT PREVIEW WRAPPER FOR ADMIN PANE ISOLATION
// ============================================================================

export const ThemePreviewWrapper: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}> = ({ children, style, className }) => {
    const { draftPayload, fontPairs, activeFontPair } = useTheme();
    const previewRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (previewRef.current && draftPayload) {
            const previewTokens: ThemeTokens = {
                canvas_bg: draftPayload.canvas_bg || '#060708',
                surface_bg: draftPayload.surface_bg || '#0D1117',
                card_bg: draftPayload.card_bg || '#161B22',
                accent_primary: draftPayload.accent_primary || '#10B981',
                accent_secondary: draftPayload.accent_secondary || '#00E5FF',
                font_pair_id: draftPayload.font_pair_id || '00000000-0000-0000-0000-000000000010',
                radius_scale: draftPayload.radius_scale || 'soft',
            };
            const previewFontPair = fontPairs.find((f) => f.id === previewTokens.font_pair_id) || activeFontPair;
            applyThemeToElement(previewTokens, previewFontPair, previewRef.current);
        }
    }, [draftPayload, fontPairs, activeFontPair]);

    return (
        <div ref={previewRef} data-theme="preview" className={className} style={{ transition: 'all 0.2s ease', ...style }}>
            {children}
        </div>
    );
};
