import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{ backgroundColor: '#FAFAFA', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', maxWidth: '520px', backgroundColor: '#FFFFFF', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
            >
                <div style={{ fontSize: '5rem', fontWeight: 900, color: '#E52535', lineHeight: 1, marginBottom: '0.5rem' }}>404</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Page Not Found</h1>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F4B400', marginBottom: '1rem' }}>
                    "Change Your LifeStyle with Candy Kids"
                </div>
                <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    The page you are looking for might have been moved or is temporarily unavailable. Let's guide you back to our luxury kids collection.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/"
                        className="btn btn-primary"
                        style={{ fontSize: '0.88rem', height: '44px', padding: '0 20px' }}
                    >
                        <Home size={16} /> Back to Home
                    </Link>
                    <Link
                        to="/collection"
                        className="btn btn-outline"
                        style={{ fontSize: '0.88rem', height: '44px', padding: '0 20px' }}
                    >
                        <ArrowLeft size={16} /> Browse Collection
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
