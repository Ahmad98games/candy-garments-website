import React from 'react';
import { Truck, Clock, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';
import './Cart.css';

export default function Shipping() {
    return (
        <div className="cart-page">
            {/* HERO HEADER - Matches Cart & Checkout Pages */}
            <header className="cart-hero">
                <div className="cart-hero-content animate-fade-in-up">
                    <h1 className="cart-title">Shipping & TCS Delivery Policy</h1>
                    <p className="cart-subtitle">
                        100% Advance Bank Transfer • Nationwide Dispatch via TCS Express Courier
                    </p>
                </div>
            </header>

            <div className="cart-container" style={{ maxWidth: '960px' }}>
                {/* POLICY WARNING BANNER */}
                <div className="policy-banner">
                    <AlertTriangle className="policy-banner-icon" size={22} />
                    <div className="policy-banner-content">
                        <span className="policy-banner-title">⚠️ Strict Advance Payment & Fixed-Price Policy</span>
                        All articles are sold at firm, fixed factory rates. <strong>No Cash on Delivery (COD) available.</strong> Orders are strictly queued for nationwide dispatch via <strong>TCS Express Courier</strong> upon receipt of 100% advance bank transfer.
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                            <CreditCard size={20} /> 100% Advance Bank Payment Requirement
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            <strong>No Cash on Delivery (COD) available.</strong> All orders are sold at firm factory prices and require 100% advance bank transfer to our verified Faysal Bank accounts. Orders are queued for dispatch immediately upon receipt of your transfer screenshot on WhatsApp.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>
                            <Truck size={20} /> TCS Express Courier Dispatch
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            All parcels are shipped nationwide exclusively via <strong>TCS Express Courier</strong>.
                            <br />• <strong>Free Shipping:</strong> On all orders above Rs. 3,000 across Pakistan!
                            <br />• <strong>Standard Shipping:</strong> Rs. 250 for orders below Rs. 3,000.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                            <Clock size={20} /> Delivery Timelines
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            • <strong>Major Cities (Lahore, Karachi, Islamabad, Faisalabad):</strong> 2 – 3 working days via TCS.
                            <br />• <strong>Rest of Pakistan:</strong> 3 – 4 working days via TCS Express.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                            <ShieldCheck size={20} /> Real-Time TCS Tracking
                        </div>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                            As soon as your payment is verified and TCS picks up your parcel, a direct TCS tracking consignment code is shared with you via SMS and WhatsApp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

