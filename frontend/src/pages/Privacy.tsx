import React from 'react';
import { Lock, Eye, ShieldCheck } from 'lucide-react';

export default function Privacy() {
    return (
        <div style={{ backgroundColor: '#FAFAFA', color: '#111827', paddingTop: '30px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '840px' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>Privacy Policy</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Candy Kids (Candy Garments) • Effective 2026</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700, color: '#0F9D58', marginBottom: '0.75rem' }}>
                            <Lock size={20} /> Data Protection & Confidentiality
                        </div>
                        <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                            At Candy Kids, we respect your family's privacy. Any personal information (name, address, phone number, email) collected during checkout or WhatsApp ordering is strictly used to process your shipment and communicate delivery updates.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700, color: '#0F9D58', marginBottom: '0.75rem' }}>
                            <Eye size={20} /> Information Usage
                        </div>
                        <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                            We do not sell, trade, or share your contact credentials with third-party advertising networks. Delivery information is securely transmitted only to authorized courier partners (e.g., TCS / Leopard).
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700, color: '#0F9D58', marginBottom: '0.75rem' }}>
                            <ShieldCheck size={20} /> Contacting Privacy Support
                        </div>
                        <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                            If you wish to update or delete your customer account information, please email support@candykids.pk or call 0331-1498773 / 0334-1495788.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
