import React from 'react';
import { Scale, FileText, Shield } from 'lucide-react';
import './Cart.css';

export default function Terms() {
    return (
        <div className="cart-page">
            {/* HERO HEADER - Matches Cart & Checkout Pages */}
            <header className="cart-hero">
                <div className="cart-hero-content animate-fade-in-up">
                    <h1 className="cart-title">Terms & Conditions</h1>
                    <p className="cart-subtitle">
                        Candy Kids Garments • Official Terms of Service & Dispatch Policy
                    </p>
                </div>
            </header>

            <div className="cart-container" style={{ maxWidth: '960px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                            <Scale size={20} /> 1. General Agreement
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            By placing an order via our online storefront or WhatsApp, you agree to be bound by these Terms of Service. Candy Kids reserves the right to modify pricing, fabric specifications, or availability at any time.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                            <FileText size={20} /> 2. Strict Fixed Price & 100% Advance Payment Policy
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            All articles are sold at firm, fixed factory rates. <strong>No Cash on Delivery (COD) available.</strong> Orders are strictly queued for dispatch nationwide via <strong>TCS Express Courier</strong> upon successful receipt of 100% advance bank payment to our verified Faysal Bank accounts. Payment receipts / transfer screenshots must be shared via WhatsApp to confirm order dispatch.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                            <Shield size={20} /> 3. Exchange & Return Policy
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            Articles with manufacturing defects or size mismatch can be exchanged within 7 days of delivery in unused condition with tags attached. Please contact our helpline: 0331-1498773 / 0334-1495788.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

