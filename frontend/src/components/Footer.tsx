import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import './Footer.css';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setEmail('');
            }, 3000);
        }, 1000);
    };

    return (
        <footer className="footer-enhanced">
            <div className="footer-container footer-grid-enhanced">

                {/* 1. BRAND COLUMN */}
                <div className="footer-brand-col">
                    <Link to="/" className="footer-logo">
                        <img src="/images/candy.jpg" alt="Candy Kids Logo" style={{ height: '40px', width: 'auto', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                            <div className="footer-logo-title">CANDY KIDS</div>
                            <div className="footer-logo-sub">CANDY GARMENTS</div>
                        </div>
                    </Link>

                    <div className="footer-slogan">
                        "Change Your LifeStyle with Candy Kids"
                    </div>

                    <p className="footer-desc">
                        High-end luxury children's & couture retail brand. Delivering premium fabrics, impeccable stitching, and trendy lifestyle fashion for Girls, Kids, and Ladies Wear nationwide.
                    </p>

                    <div className="footer-contacts">
                        <a href="tel:03311498773" className="footer-contact-link">
                            <Phone size={14} /> Helpline 1: 0331-1498773
                        </a>
                        <a href="tel:03341495788" className="footer-contact-link">
                            <Phone size={14} /> Helpline 2: 0334-1495788
                        </a>
                        <a href="mailto:support@candykids.pk" className="footer-contact-link">
                            <Mail size={14} /> Email: support@candykids.pk
                        </a>
                    </div>
                </div>

                {/* 2. SITEMAP COLUMN */}
                <div className="footer-links-col">
                    <h4>Categories</h4>
                    <nav>
                        <Link to="/collection/ladies" className="footer-link">Ladies Wear Collection</Link>
                        <Link to="/collection/kids" className="footer-link">Girls & Kids Collection</Link>
                        <Link to="/collection" className="footer-link">All Collections</Link>
                        <Link to="/collection?sale=true" className="footer-link">Sale & Promotions</Link>
                    </nav>
                </div>

                {/* 3. SUPPORT & LEGAL */}
                <div className="footer-links-col">
                    <h4>Customer Care</h4>
                    <nav>
                        <Link to="/about" className="footer-link">About Candy Kids</Link>
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                        <Link to="/shipping" className="footer-link">Shipping & Delivery</Link>
                        <Link to="/terms" className="footer-link">Terms & Conditions</Link>
                        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                        <button 
                            onClick={() => {
                                sessionStorage.removeItem('candy_pwa_dismissed');
                                window.location.reload();
                            }} 
                            className="footer-link"
                            style={{ background: 'none', border: 'none', padding: 0, color: '#EC4899', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                        >
                            📱 Install Candy PWA App
                        </button>
                    </nav>
                </div>

                {/* 4. NEWSLETTER & SOCIALS */}
                <div className="footer-newsletter-col">
                    <h4>Newsletter</h4>
                    <p className="newsletter-text">Subscribe to get exclusive early access to new seasonal drops and special discounts.</p>

                    <form onSubmit={handleSubscribe} className="footer-subscribe-form">
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status !== 'idle'}
                            />
                            <button type="submit" disabled={status !== 'idle'}>
                                {status === 'loading' ? <Loader2 className="animate-spin" size={16} /> :
                                    status === 'success' ? <span style={{ color: '#0F9D58' }}>✓</span> :
                                        <ArrowRight size={16} />}
                            </button>
                        </div>
                        {status === 'success' && <span style={{ fontSize: '0.78rem', color: '#0F9D58', marginTop: '4px' }}>Thank you for subscribing!</span>}
                    </form>

                    <div style={{ marginTop: '1rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Follow Our Socials</span>
                        <div className="social-links">
                            <a
                                href="https://www.facebook.com/share/1DJSvC3piZ/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                                aria-label="Facebook"
                                title="Facebook"
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/candy_kids_garments?igsh=ZjM0MG5nazlqZXk3"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                                aria-label="Instagram"
                                title="Instagram"
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Accepted Payment Methods</span>
                        <div className="payment-badges">
                            <span className="payment-badge">100% Advance Bank Transfer (Strict No COD)</span>
                            <span className="payment-badge">Faysal Bank Transfer</span>
                            <span className="payment-badge">TCS Express Courier Dispatch</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM COPYRIGHT BAR */}
            <div className="footer-bottom-bar">
                <div className="footer-container bottom-flex">
                    <div className="copyright">
                        © 2026 Omnora | Omnora-Ahmad Mahboob. All rights reserved.
                    </div>
                    <div style={{ color: '#E5E7EB', fontSize: '0.82rem', fontWeight: 600 }}>
                        Candy — Engineered by Omnora-Ahmad Mahboob
                    </div>
                </div>
            </div>
        </footer>
    );
}