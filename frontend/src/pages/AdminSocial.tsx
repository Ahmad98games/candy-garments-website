import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import {
    Share2, ExternalLink, MessageCircle, Save, CheckCircle,
    AlertCircle, Layout, Eye, Check, ShieldCheck
} from 'lucide-react';
import './AdminSocial.css';

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

const DEFAULT_SOCIAL_SETTINGS: SiteSocialSettings = {
    id: '00000000-0000-0000-0000-000000000002',
    instagram_url: 'https://instagram.com/omnora',
    facebook_url: 'https://facebook.com/omnora',
    tiktok_url: 'https://tiktok.com/@omnora',
    youtube_url: 'https://youtube.com/@omnora',
    whatsapp_number: '+923311498773',
    whatsapp_business_message_template: 'Hi Candy Kids! I have an inquiry regarding Order #{{order_id}} for {{customer_name}}.',
    show_in_header: true,
    show_in_footer: true,
    show_share_buttons_on_product: true,
    show_on_order_confirmation: true,
};

// E.164 phone pattern: + followed by 7-15 digits
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export default function AdminSocial() {
    const [settings, setSettings] = useState<SiteSocialSettings>(DEFAULT_SOCIAL_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    // 1. FETCH SOCIAL SETTINGS FROM SUPABASE
    useEffect(() => {
        async function fetchSocial() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('site_social_settings')
                    .select('*')
                    .eq('id', '00000000-0000-0000-0000-000000000002')
                    .single();

                if (data && !error) {
                    setSettings(data as SiteSocialSettings);
                }
            } catch (err) {
                console.warn('Using default social settings:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchSocial();
    }, []);

    // 2. URL PLATFORM PATTERN VALIDATION
    const errors = useMemo(() => {
        const errs: Record<string, string> = {};

        if (settings.instagram_url && !/instagram\.com/i.test(settings.instagram_url)) {
            errs.instagram_url = 'Invalid Instagram URL. Must contain "instagram.com"';
        }
        if (settings.facebook_url && !/facebook\.com/i.test(settings.facebook_url)) {
            errs.facebook_url = 'Invalid Facebook URL. Must contain "facebook.com"';
        }
        if (settings.tiktok_url && !/tiktok\.com/i.test(settings.tiktok_url)) {
            errs.tiktok_url = 'Invalid TikTok URL. Must contain "tiktok.com"';
        }
        if (settings.youtube_url && !/(youtube\.com|youtu\.be)/i.test(settings.youtube_url)) {
            errs.youtube_url = 'Invalid YouTube URL. Must contain "youtube.com" or "youtu.be"';
        }
        if (settings.whatsapp_number && !E164_PHONE_REGEX.test(settings.whatsapp_number.trim())) {
            errs.whatsapp_number = 'Invalid E.164 phone format. Must start with "+" followed by country code and 7-14 digits (e.g. +923000000000)';
        }

        return errs;
    }, [settings]);

    const hasErrors = Object.keys(errors).length > 0;

    // 3. WHATSAPP LIVE DEEP LINK PREVIEW GENERATION
    const sampleMessage = useMemo(() => {
        let msg = settings.whatsapp_business_message_template || '';
        msg = msg.replace(/{{order_id}}/g, 'OMN-9842');
        msg = msg.replace(/{{customer_name}}/g, 'John Doe');
        return msg;
    }, [settings.whatsapp_business_message_template]);

    const liveWhatsAppLink = useMemo(() => {
        const cleanPhone = (settings.whatsapp_number || '').replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleMessage)}`;
    }, [settings.whatsapp_number, sampleMessage]);

    // 4. SAVE HANDLER
    const handleSave = async () => {
        if (hasErrors) {
            showToast('Please fix validation errors before saving.', 'error');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_social_settings')
                .upsert([
                    {
                        ...settings,
                        updated_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                showToast(`Failed to save social settings: ${error.message}`, 'error');
            } else {
                showToast('Social settings and WhatsApp deep links saved!', 'success');
            }
        } catch (err) {
            console.error('Save social settings error:', err);
            showToast('Failed to save social settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestLink = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="admin-social-container animate-fade-in">
            {/* HEADER */}
            <header className="social-header">
                <div>
                    <div className="header-badge font-mono" style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', background: 'rgba(212, 175, 55, 0.1)' }}>
                        <ShieldCheck size={16} style={{ color: '#D4AF37' }} /> PRIVATE ATELIER DECK · OWNER: AHMAD MAHBOOB
                    </div>
                    <h1 style={{ fontFamily: 'Cinzel, serif', color: '#F9F6F0' }}>Social Media & WhatsApp Command Deck</h1>
                    <p className="text-muted">
                        Configure validated brand URLs, E.164 WhatsApp deep links, and visual layout placement toggles for Omnora Couture Atelier.
                    </p>
                </div>

                <button
                    className="btn btn-emerald"
                    onClick={handleSave}
                    disabled={saving || hasErrors || loading}
                    style={{ height: '40px', fontSize: '13px', background: 'linear-gradient(135deg, #D4AF37, #AA771C)', color: '#0A0908', fontWeight: 700, border: 'none' }}
                >
                    <Save size={16} />
                    {saving ? 'Saving Settings...' : 'Save Settings'}
                </button>
            </header>

            {/* MAIN GRID */}
            <div className="social-grid">

                {/* LEFT COLUMN: PLATFORM URLS & WHATSAPP */}
                <div className="social-form-deck">

                    {/* SECTION 1: SOCIAL PLATFORM URLS */}
                    <div className="form-card">
                        <div className="card-header">
                            <h3>Validated Social Platform Links</h3>
                            <p className="text-muted">Each URL is strictly pattern-checked against its platform domain.</p>
                        </div>

                        <div className="form-group-list">
                            
                            {/* INSTAGRAM */}
                            <div className="form-field">
                                <label>Instagram Profile URL</label>
                                <div className="field-input-row">
                                    <input
                                        type="url"
                                        className={`form-input font-mono ${errors.instagram_url ? 'error' : ''}`}
                                        value={settings.instagram_url}
                                        onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                        placeholder="https://instagram.com/omnora"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-test"
                                        onClick={() => handleTestLink(settings.instagram_url)}
                                        disabled={!settings.instagram_url}
                                    >
                                        <ExternalLink size={14} /> Test
                                    </button>
                                </div>
                                {errors.instagram_url && <span className="field-error">{errors.instagram_url}</span>}
                            </div>

                            {/* FACEBOOK */}
                            <div className="form-field">
                                <label>Facebook Page URL</label>
                                <div className="field-input-row">
                                    <input
                                        type="url"
                                        className={`form-input font-mono ${errors.facebook_url ? 'error' : ''}`}
                                        value={settings.facebook_url}
                                        onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                        placeholder="https://facebook.com/omnora"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-test"
                                        onClick={() => handleTestLink(settings.facebook_url)}
                                        disabled={!settings.facebook_url}
                                    >
                                        <ExternalLink size={14} /> Test
                                    </button>
                                </div>
                                {errors.facebook_url && <span className="field-error">{errors.facebook_url}</span>}
                            </div>

                            {/* TIKTOK */}
                            <div className="form-field">
                                <label>TikTok Profile URL</label>
                                <div className="field-input-row">
                                    <input
                                        type="url"
                                        className={`form-input font-mono ${errors.tiktok_url ? 'error' : ''}`}
                                        value={settings.tiktok_url}
                                        onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                                        placeholder="https://tiktok.com/@omnora"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-test"
                                        onClick={() => handleTestLink(settings.tiktok_url)}
                                        disabled={!settings.tiktok_url}
                                    >
                                        <ExternalLink size={14} /> Test
                                    </button>
                                </div>
                                {errors.tiktok_url && <span className="field-error">{errors.tiktok_url}</span>}
                            </div>

                            {/* YOUTUBE */}
                            <div className="form-field">
                                <label>YouTube Channel URL</label>
                                <div className="field-input-row">
                                    <input
                                        type="url"
                                        className={`form-input font-mono ${errors.youtube_url ? 'error' : ''}`}
                                        value={settings.youtube_url}
                                        onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                                        placeholder="https://youtube.com/@omnora"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-test"
                                        onClick={() => handleTestLink(settings.youtube_url)}
                                        disabled={!settings.youtube_url}
                                    >
                                        <ExternalLink size={14} /> Test
                                    </button>
                                </div>
                                {errors.youtube_url && <span className="field-error">{errors.youtube_url}</span>}
                            </div>

                        </div>
                    </div>

                    {/* SECTION 2: WHATSAPP DEEP LINK & TEMPLATE */}
                    <div className="form-card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageCircle size={18} className="text-emerald" />
                                <h3>WhatsApp Business E.164 Deep Link</h3>
                            </div>
                            <p className="text-muted">Configure customer support WhatsApp number and order template placeholders.</p>
                        </div>

                        <div className="form-group-list">
                            <div className="form-field">
                                <label>WhatsApp Phone Number (E.164 Format Required)</label>
                                <input
                                    type="text"
                                    className={`form-input font-mono ${errors.whatsapp_number ? 'error' : ''}`}
                                    value={settings.whatsapp_number}
                                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                    placeholder="+923000000000"
                                />
                                {errors.whatsapp_number ? (
                                    <span className="field-error">{errors.whatsapp_number}</span>
                                ) : (
                                    <span className="field-hint font-mono text-emerald">Format: +[CountryCode][Number]</span>
                                )}
                            </div>

                            <div className="form-field">
                                <label>Order Confirmation Pre-filled Message Template</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={settings.whatsapp_business_message_template}
                                    onChange={(e) => setSettings({ ...settings, whatsapp_business_message_template: e.target.value })}
                                    placeholder="Hi Omnora! I have an inquiry regarding Order #{{order_id}} for {{customer_name}}."
                                />
                                <span className="field-hint text-muted">Available Placeholders: <code>{`{{order_id}}`}</code>, <code>{`{{customer_name}}`}</code></span>
                            </div>

                            {/* LIVE WA.ME PREVIEW BOX */}
                            <div className="wa-preview-box">
                                <div className="wa-preview-header font-mono">
                                    <Eye size={14} className="text-cyan" /> LIVE DEEP LINK PREVIEW
                                </div>
                                <div className="wa-sample-message">
                                    <strong>Sample Message:</strong> "{sampleMessage}"
                                </div>
                                <div className="wa-sample-url font-mono">
                                    <a href={liveWhatsAppLink} target="_blank" rel="noopener noreferrer">
                                        {liveWhatsAppLink} <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: VISUAL PLACEMENT TOGGLES */}
                <div className="social-toggles-deck">
                    <div className="form-card sticky-toggles">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layout size={18} className="text-cyan" />
                                <h3>Visual Placement Toggles</h3>
                            </div>
                            <p className="text-muted">Live visual thumbnails showing exactly where social elements render.</p>
                        </div>

                        <div className="toggles-list">
                            
                            {/* TOGGLE 1: HEADER */}
                            <div className="toggle-card">
                                <div className="toggle-main">
                                    <div>
                                        <strong>Show Social Icons in Navigation Header</strong>
                                        <p className="text-muted">Renders brand icons in sticky top bar.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={settings.show_in_header}
                                        onChange={(e) => setSettings({ ...settings, show_in_header: e.target.checked })}
                                    />
                                </div>
                                <div className="placement-thumbnail header-thumb">
                                    <div className="mini-bar">
                                        <div className="mini-logo font-mono">OMNORA</div>
                                        <div className={`mini-icons ${settings.show_in_header ? 'visible' : 'hidden'}`}>
                                            <span className="dot cyan" /><span className="dot emerald" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TOGGLE 2: FOOTER */}
                            <div className="toggle-card">
                                <div className="toggle-main">
                                    <div>
                                        <strong>Show Social Icons in Footer Strip</strong>
                                        <p className="text-muted">Renders social links bottom deck.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={settings.show_in_footer}
                                        onChange={(e) => setSettings({ ...settings, show_in_footer: e.target.checked })}
                                    />
                                </div>
                                <div className="placement-thumbnail footer-thumb">
                                    <div className="mini-footer-box">
                                        <div className={`mini-icons ${settings.show_in_footer ? 'visible' : 'hidden'}`}>
                                            <span className="dot" /><span className="dot" /><span className="dot" />
                                        </div>
                                        <span className="font-mono text-muted">© 2026 OMNORA</span>
                                    </div>
                                </div>
                            </div>

                            {/* TOGGLE 3: PRODUCT SHARE */}
                            <div className="toggle-card">
                                <div className="toggle-main">
                                    <div>
                                        <strong>Product Page Share Buttons</strong>
                                        <p className="text-muted">Social share buttons on detail page.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={settings.show_share_buttons_on_product}
                                        onChange={(e) => setSettings({ ...settings, show_share_buttons_on_product: e.target.checked })}
                                    />
                                </div>
                                <div className="placement-thumbnail product-thumb">
                                    <div className="mini-prod-box">
                                        <div className="mini-buy-btn font-mono">BUY NOW</div>
                                        {settings.show_share_buttons_on_product && (
                                            <div className="mini-share-row font-mono text-cyan">
                                                SHARE ➔ [IG] [FB] [WA]
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TOGGLE 4: ORDER CONFIRMATION */}
                            <div className="toggle-card">
                                <div className="toggle-main">
                                    <div>
                                        <strong>Order Confirmation WhatsApp Trigger</strong>
                                        <p className="text-muted">Direct support button on checkout receipt.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={settings.show_on_order_confirmation}
                                        onChange={(e) => setSettings({ ...settings, show_on_order_confirmation: e.target.checked })}
                                    />
                                </div>
                                <div className="placement-thumbnail order-thumb">
                                    <div className="mini-order-box">
                                        <div className="font-mono text-emerald" style={{ fontSize: '10px' }}>✓ ORDER #9842 CONFIRMED</div>
                                        {settings.show_on_order_confirmation && (
                                            <div className="mini-wa-btn font-mono">
                                                <MessageCircle size={10} /> TRACK VIA WHATSAPP
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
