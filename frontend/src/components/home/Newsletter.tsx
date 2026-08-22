import React, { useState } from 'react';
import client from '../../api/client';
import '../../pages/Home.css';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await client.post('/newsletter', { email });
            setStatus('success');
            setMessage('Thank you for subscribing!');
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to subscribe. Please try again.');
        }
    };

    return (
        <section className="newsletter-section">
             {/* Decorative Background Elements */}
            <div className="newsletter-glow"></div>
            
            <div className="container">
                <div className="newsletter-wrapper">
                    <div className="newsletter-header">
                        <span className="badge">Exclusive Access</span>
                        <h2>Join the Omnora Family</h2>
                        <p>Unlock early access to our ethereal collections and self-care rituals.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="newsletter-success-card">
                            <div className="success-icon">✨</div>
                            <h3>Welcome Aboard</h3>
                            <p>{message}</p>
                        </div>
                    ) : (
                        <form className="newsletter-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="newsletter-input"
                                />
                                <div className="input-line"></div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className={`btn-gold ${status === 'loading' ? 'loading' : ''}`} 
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Processing...' : 'Subscribe'}
                            </button>
                        </form>
                    )}

                    {status === 'error' && (
                        <div className="newsletter-error">
                            ⚠️ {message}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}