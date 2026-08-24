import React, { useState, useMemo } from 'react';
import { useTheme, ThemePreviewWrapper, RADIUS_PRESETS, RadiusScale } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
    Palette, Type, Box, Check, Save, UploadCloud, AlertTriangle,
    RotateCcw, Sparkles, ShoppingBag, Heart, Shield, RefreshCw, Eye
} from 'lucide-react';
import './AdminTheme.css';

// ============================================================================
// 1. PRE-APPROVED ACCENT PAIRS (Contrast-Tested)
// ============================================================================

export const PRESET_ACCENT_PAIRS = [
    { label: 'Obsidian Emerald', primary: '#10B981', secondary: '#00E5FF' },
    { label: 'Neon Cyber', primary: '#00E5FF', secondary: '#10B981' },
    { label: 'Warm Amber', primary: '#F59E0B', secondary: '#EF4444' },
    { label: 'Royal Amethyst', primary: '#8B5CF6', secondary: '#F59E0B' },
    { label: 'Crimson Flare', primary: '#EF4444', secondary: '#00E5FF' },
    { label: 'Vibrant Lotus', primary: '#EC4899', secondary: '#00E5FF' },
];

// ============================================================================
// 2. WCAG CONTRAST & LUMINANCE HELPERS
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const cleanHex = hex.replace('#', '');
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

function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// 3. MAIN ADMIN THEME COMPONENT
// ============================================================================

export default function AdminTheme() {
    const {
        theme,
        fontPairs,
        activeFontPair,
        draftPayload,
        isDraftModified,
        updateDraftPayload,
        saveDraftPayload,
        publishTheme,
        resetDraftPayload,
    } = useTheme();

    const { showToast } = useToast();

    // UI Panel Tab state
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'shape'>('colors');
    const [showAdvancedColors, setShowAdvancedColors] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Body scroll lock containment when publish modal is active
    useEffect(() => {
        if (showPublishModal) {
            const originalOverflow = document.body.style.overflow;
            const originalTouchAction = document.body.style.touchAction;
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.touchAction = originalTouchAction;
            };
        }
    }, [showPublishModal]);

    // Dynamic Draft Token Extractors
    const currentPrimary = draftPayload.accent_primary || theme.accent_primary;
    const currentSecondary = draftPayload.accent_secondary || theme.accent_secondary;
    const currentCanvas = draftPayload.canvas_bg || theme.canvas_bg;
    const currentSurface = draftPayload.surface_bg || theme.surface_bg;
    const currentCard = draftPayload.card_bg || theme.card_bg;
    const currentFontPairId = draftPayload.font_pair_id || theme.font_pair_id;
    const currentRadiusScale = (draftPayload.radius_scale || theme.radius_scale) as RadiusScale;

    // WCAG & Luminance Validation Check
    const contrastRatioPrimary = useMemo(() => getContrastRatio(currentPrimary, currentCanvas), [currentPrimary, currentCanvas]);
    const contrastRatioSecondary = useMemo(() => getContrastRatio(currentSecondary, currentCanvas), [currentSecondary, currentCanvas]);
    const canvasLuminance = useMemo(() => getLuminance(currentCanvas), [currentCanvas]);

    const isContrastError = contrastRatioPrimary < 4.5 || contrastRatioSecondary < 4.5;
    const isLuminanceError = canvasLuminance > 0.15; // Must remain within dark obsidian scale
    const hasValidationError = isContrastError || isLuminanceError;

    // Handlers
    const handleSelectPresetPair = (primary: string, secondary: string) => {
        updateDraftPayload({ accent_primary: primary, accent_secondary: secondary });
        showToast('Accent pair updated in draft', 'success');
    };

    const handleSelectFontPair = (fontPairId: string) => {
        updateDraftPayload({ font_pair_id: fontPairId });
        showToast('Font typography pair updated', 'success');
    };

    const handleSelectRadiusScale = (scale: RadiusScale) => {
        updateDraftPayload({ radius_scale: scale });
        showToast(`Radius scale set to ${scale.toUpperCase()}`, 'success');
    };

    const handleSaveDraft = async () => {
        if (hasValidationError) {
            showToast('Please fix contrast/luminance validation warnings before saving.', 'error');
            return;
        }
        setSaving(true);
        const success = await saveDraftPayload();
        setSaving(false);
        if (success) {
            showToast('Draft theme settings saved successfully!', 'success');
        } else {
            showToast('Failed to save draft theme.', 'error');
        }
    };

    const handleConfirmPublish = async () => {
        if (hasValidationError) {
            showToast('Cannot publish with active validation errors.', 'error');
            return;
        }
        setPublishing(true);
        const success = await publishTheme();
        setPublishing(false);
        setShowPublishModal(false);
        if (success) {
            showToast('Theme published to live storefront in real-time!', 'success');
        } else {
            showToast('Failed to publish theme.', 'error');
        }
    };

    // Calculate Diff Summary for Publish Modal
    const diffItems = useMemo(() => {
        const items: { field: string; from: string; to: string }[] = [];
        if ((draftPayload.accent_primary || theme.accent_primary) !== theme.accent_primary) {
            items.push({ field: 'Primary Accent', from: theme.accent_primary, to: draftPayload.accent_primary! });
        }
        if ((draftPayload.accent_secondary || theme.accent_secondary) !== theme.accent_secondary) {
            items.push({ field: 'Secondary Accent', from: theme.accent_secondary, to: draftPayload.accent_secondary! });
        }
        if ((draftPayload.font_pair_id || theme.font_pair_id) !== theme.font_pair_id) {
            const oldFont = fontPairs.find(f => f.id === theme.font_pair_id)?.label || 'Default';
            const newFont = fontPairs.find(f => f.id === draftPayload.font_pair_id)?.label || 'New';
            items.push({ field: 'Font Typography Pair', from: oldFont, to: newFont });
        }
        if ((draftPayload.radius_scale || theme.radius_scale) !== theme.radius_scale) {
            items.push({ field: 'Radius Scale', from: theme.radius_scale, to: draftPayload.radius_scale! });
        }
        if ((draftPayload.canvas_bg || theme.canvas_bg) !== theme.canvas_bg) {
            items.push({ field: 'Canvas Background', from: theme.canvas_bg, to: draftPayload.canvas_bg! });
        }
        return items;
    }, [draftPayload, theme, fontPairs]);

    return (
        <div className="admin-theme-container animate-fade-in">
            
            {/* TOP HEADER */}
            <header className="theme-header">
                <div className="header-info">
                    <div className="header-badge">
                        <Sparkles size={16} className="text-cyan" />
                        <span>THEME DESIGN SYSTEM ENGINE</span>
                    </div>
                    <h1>Visual Identity & Tokens</h1>
                    <p className="text-muted">
                        Customize accent colorways, high-legibility font pairs, and industrial border radii with real-time storefront sync.
                    </p>
                </div>

                <div className="header-actions">
                    {isDraftModified && (
                        <button className="btn btn-outline" onClick={resetDraftPayload}>
                            <RotateCcw size={16} />
                            Reset Draft
                        </button>
                    )}
                    <button
                        className="btn btn-outline"
                        onClick={handleSaveDraft}
                        disabled={saving || hasValidationError}
                    >
                        <Save size={16} />
                        {saving ? 'Saving Draft...' : 'Save Draft'}
                    </button>
                    <button
                        className="btn btn-emerald"
                        onClick={() => setShowPublishModal(true)}
                        disabled={publishing || hasValidationError}
                    >
                        <UploadCloud size={16} />
                        Publish to Live Site
                    </button>
                </div>
            </header>

            {/* MAIN TWO-COLUMN SPLIT */}
            <div className="theme-layout-grid">

                {/* LEFT COLUMN: CONTROL PANELS */}
                <div className="theme-control-deck">

                    {/* PANEL TABS SWITCHER */}
                    <div className="panel-tab-bar">
                        <button
                            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
                            onClick={() => setActiveTab('colors')}
                        >
                            <Palette size={16} />
                            <span>Colors</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'typography' ? 'active' : ''}`}
                            onClick={() => setActiveTab('typography')}
                        >
                            <Type size={16} />
                            <span>Typography</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'shape' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shape')}
                        >
                            <Box size={16} />
                            <span>Shape & Radius</span>
                        </button>
                    </div>

                    {/* TAB 1: COLORS PANEL */}
                    {activeTab === 'colors' && (
                        <div className="panel-content animate-fade-in">
                            <div className="panel-section-title">
                                <h3>Pre-Approved Accent Colorways</h3>
                                <p className="text-muted">
                                    Contrast-tested color pairs guaranteed to maintain 4.5:1+ WCAG compliance against obsidian dark backgrounds.
                                </p>
                            </div>

                            {/* PRESET PAIR SWATCH GRID */}
                            <div className="swatch-grid">
                                {PRESET_ACCENT_PAIRS.map((pair, idx) => {
                                    const isSelected =
                                        currentPrimary === pair.primary && currentSecondary === pair.secondary;
                                    return (
                                        <button
                                            key={idx}
                                            className={`swatch-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectPresetPair(pair.primary, pair.secondary)}
                                        >
                                            <div className="swatch-dual-pill">
                                                <span className="swatch-half" style={{ background: pair.primary }} />
                                                <span className="swatch-half" style={{ background: pair.secondary }} />
                                            </div>
                                            <div className="swatch-label">
                                                <span>{pair.label}</span>
                                                <div className="swatch-codes font-mono">
                                                    {pair.primary} / {pair.secondary}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="swatch-check">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ADVANCED CUSTOM COLORS ACCORDION TOGGLE */}
                            <div className="advanced-toggle-deck">
                                <button
                                    className="btn-toggle-advanced"
                                    onClick={() => setShowAdvancedColors(!showAdvancedColors)}
                                >
                                    <span>Advanced Custom Hex Colors</span>
                                    <span className="font-mono">{showAdvancedColors ? '[-] Hide' : '[+] Expand'}</span>
                                </button>

                                {showAdvancedColors && (
                                    <div className="advanced-form-card animate-fade-in">
                                        <div className="form-group-row">
                                            <div className="form-group">
                                                <label>Primary Accent (CTA Buttons)</label>
                                                <div className="hex-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className="form-input font-mono"
                                                        value={currentPrimary}
                                                        onChange={(e) => updateDraftPayload({ accent_primary: e.target.value })}
                                                    />
                                                    <span className="hex-color-badge" style={{ background: currentPrimary }} />
                                                </div>
                                                <span className="input-hint font-mono">
                                                    WCAG Contrast: {contrastRatioPrimary.toFixed(1)}:1
                                                </span>
                                            </div>

                                            <div className="form-group">
                                                <label>Secondary Accent (Highlights)</label>
                                                <div className="hex-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className="form-input font-mono"
                                                        value={currentSecondary}
                                                        onChange={(e) => updateDraftPayload({ accent_secondary: e.target.value })}
                                                    />
                                                    <span className="hex-color-badge" style={{ background: currentSecondary }} />
                                                </div>
                                                <span className="input-hint font-mono">
                                                    WCAG Contrast: {contrastRatioSecondary.toFixed(1)}:1
                                                </span>
                                            </div>
                                        </div>

                                        <div className="form-group-row" style={{ marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label>Canvas Background (Obsidian Locked)</label>
                                                <div className="hex-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className="form-input font-mono"
                                                        value={currentCanvas}
                                                        onChange={(e) => updateDraftPayload({ canvas_bg: e.target.value })}
                                                    />
                                                    <span className="hex-color-badge" style={{ background: currentCanvas }} />
                                                </div>
                                                <span className="input-hint font-mono">
                                                    Luminance: {canvasLuminance.toFixed(3)}
                                                </span>
                                            </div>

                                            <div className="form-group">
                                                <label>Card Background Surface</label>
                                                <div className="hex-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className="form-input font-mono"
                                                        value={currentCard}
                                                        onChange={(e) => updateDraftPayload({ card_bg: e.target.value })}
                                                    />
                                                    <span className="hex-color-badge" style={{ background: currentCard }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* VALIDATION WARNING MESSAGES */}
                                        {isContrastError && (
                                            <div className="validation-alert error animate-fade-in">
                                                <AlertTriangle size={18} />
                                                <div>
                                                    <strong>WCAG Contrast Warning!</strong>
                                                    <p>
                                                        Accent colors must maintain at least a 4.5:1 contrast ratio against the obsidian background. Please select a brighter hex value or revert to a preset.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {isLuminanceError && (
                                            <div className="validation-alert error animate-fade-in">
                                                <AlertTriangle size={18} />
                                                <div>
                                                    <strong>Obsidian Luminance Warning!</strong>
                                                    <p>
                                                        Background canvas luminance is too light. Canvas must remain within the near-black scale to prevent breaking off-white text contrast.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TYPOGRAPHY PANEL */}
                    {activeTab === 'typography' && (
                        <div className="panel-content animate-fade-in">
                            <div className="panel-section-title">
                                <h3>Curated Font Typography Pairs</h3>
                                <p className="text-muted">
                                    Pre-tested typography pairings combining high-impact headings, legible body copy, and precision monospace numerical tags.
                                </p>
                            </div>

                            <div className="font-pair-grid">
                                {fontPairs.map((pair) => {
                                    const isSelected = currentFontPairId === pair.id;
                                    return (
                                        <button
                                            key={pair.id}
                                            className={`font-pair-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectFontPair(pair.id)}
                                        >
                                            <div className="font-card-header">
                                                <span className="font-pair-label">{pair.label}</span>
                                                {isSelected && (
                                                    <span className="active-badge font-mono">ACTIVE</span>
                                                )}
                                            </div>

                                            <div className="font-sample-preview">
                                                <div
                                                    className="sample-heading"
                                                    style={{ fontFamily: `'${pair.heading_font}', sans-serif` }}
                                                >
                                                    Omnora Couture & High Fashion Atelier
                                                </div>
                                                <div
                                                    className="sample-body"
                                                    style={{ fontFamily: `'${pair.body_font}', sans-serif` }}
                                                >
                                                    Handcrafted organic essential oil blends engineered for daily spa wellness.
                                                </div>
                                                <div
                                                    className="sample-mono font-mono text-cyan"
                                                    style={{ fontFamily: `'${pair.mono_font}', monospace` }}
                                                >
                                                    ARTICLE NO: OMN-101 • Rs. 1,299
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: SHAPE & RADIUS PANEL */}
                    {activeTab === 'shape' && (
                        <div className="panel-content animate-fade-in">
                            <div className="panel-section-title">
                                <h3>Border Radius Scale Triad</h3>
                                <p className="text-muted">
                                    Select an industrial curvature scale. Radius tokens automatically cascade to all buttons, cards, and modal dialogs.
                                </p>
                            </div>

                            <div className="shape-grid">
                                {(['sharp', 'soft', 'rounded'] as RadiusScale[]).map((scale) => {
                                    const isSelected = currentRadiusScale === scale;
                                    const radii = RADIUS_PRESETS[scale];
                                    return (
                                        <button
                                            key={scale}
                                            className={`shape-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectRadiusScale(scale)}
                                        >
                                            <div className="shape-card-header">
                                                <span className="shape-title">{scale.toUpperCase()}</span>
                                                <span className="shape-values font-mono text-muted">
                                                    {radii.sm} / {radii.md} / {radii.lg}
                                                </span>
                                            </div>

                                            {/* LIVE SAMPLE MINI PREVIEW */}
                                            <div className="shape-sample-box">
                                                <div
                                                    className="sample-mini-card"
                                                    style={{
                                                        borderRadius: radii.lg,
                                                        border: '1px solid var(--border-subtle)',
                                                        background: 'var(--bg-card)',
                                                        padding: '12px',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Sample Card</span>
                                                    <div style={{ marginTop: '8px' }}>
                                                        <span
                                                            className="sample-mini-btn"
                                                            style={{
                                                                borderRadius: radii.md,
                                                                background: currentPrimary,
                                                                color: '#060708',
                                                                fontWeight: 700,
                                                                fontSize: '11px',
                                                                padding: '4px 10px',
                                                                display: 'inline-block',
                                                            }}
                                                        >
                                                            Add to Cart
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="swatch-check">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: STICKY LIVE REAL-TIME PREVIEW PANE */}
                <div className="theme-preview-deck">
                    <div className="preview-sticky-wrapper">
                        <div className="preview-header">
                            <div className="preview-title">
                                <Eye size={16} className="text-cyan" />
                                <span>LIVE DRAFT PREVIEW PANE</span>
                            </div>
                            <div className="preview-status font-mono">
                                {isDraftModified ? 'DRAFT EDITING' : 'LIVE IN SYNC'}
                            </div>
                        </div>

                        {/* ISOLATED PREVIEW WRAPPER */}
                        <ThemePreviewWrapper className="preview-canvas-frame">
                            
                            {/* MINI HERO SECTION */}
                            <div className="mini-hero">
                                <div className="mini-badge font-mono">
                                    <Sparkles size={12} /> HIGH COUTURE COLLECTION 2026
                                </div>
                                <h2>Timeless Elegance & Handcrafted Silk</h2>
                                <p>
                                    Handcrafted Pakistani luxury formal wear, fine zardozi needlework, and bespoke pret.
                                </p>
                                <div className="mini-hero-btns">
                                    <button className="mini-btn-primary">
                                        Explore Collection
                                    </button>
                                    <button className="mini-btn-outline">
                                        Learn More
                                    </button>
                                </div>
                            </div>

                            {/* MINI PRODUCT CARD */}
                            <div className="mini-product-card">
                                <div className="mini-image-slot">
                                    <img src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80" alt="Product Preview" />
                                    <button className="mini-wishlist-btn">
                                        <Heart size={14} />
                                    </button>
                                    <span className="mini-tag font-mono">BESTSELLER</span>
                                </div>
                                <div className="mini-card-body">
                                    <div className="mini-category font-mono text-cyan">PURE RAW SILK 80G</div>
                                    <h4>Noor-e-Zari Velvet Formal Suit</h4>
                                    <div className="mini-card-footer">
                                        <div className="mini-price font-mono">PKR 18,500</div>
                                        <button className="mini-cart-btn">
                                            <ShoppingBag size={12} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TRUST BADGE STRIP */}
                            <div className="mini-trust-strip">
                                <div className="trust-item font-mono">
                                    <Shield size={12} className="text-emerald" /> 100% ORGANIC
                                </div>
                                <div className="trust-item font-mono">
                                    <RefreshCw size={12} className="text-cyan" /> RAPID DISSOLVE
                                </div>
                            </div>

                        </ThemePreviewWrapper>
                    </div>
                </div>

            </div>

            {/* PUBLISH CONFIRMATION MODAL WITH BEFORE / AFTER DIFF SUMMARY */}
            {showPublishModal && (
                <div className="modal-overlay animate-fade-in" onClick={() => !publishing && setShowPublishModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-row">
                                <UploadCloud size={22} className="text-emerald" />
                                <h3>Confirm Theme Publication to Live Site</h3>
                            </div>
                        </div>

                        <div className="modal-body modal-scrollable-body">
                            <p>
                                Publishing will immediately broadcast these theme token updates to every active browser tab on the live storefront via Supabase Realtime.
                            </p>

                            <div className="diff-summary-card">
                                <h4>BEFORE / AFTER DIFF SUMMARY</h4>
                                {diffItems.length === 0 ? (
                                    <div className="diff-empty font-mono text-muted">
                                        No modifications detected. Live theme is already up to date.
                                    </div>
                                ) : (
                                    <div className="diff-table">
                                        {diffItems.map((item, i) => (
                                            <div key={i} className="diff-row">
                                                <span className="diff-field">{item.field}:</span>
                                                <span className="diff-from font-mono">{item.from}</span>
                                                <span className="diff-arrow font-mono">➔</span>
                                                <span className="diff-to font-mono text-emerald">{item.to}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowPublishModal(false)}
                                disabled={publishing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-emerald"
                                onClick={handleConfirmPublish}
                                disabled={publishing || diffItems.length === 0}
                            >
                                {publishing ? 'Publishing Live...' : 'Confirm & Publish Live'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
