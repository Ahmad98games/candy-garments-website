import React, { useEffect, useRef } from 'react';
import {
  Scissors,
  Crown,
  Sparkles,
  Heart
} from 'lucide-react';
import './About.css';
import './Cart.css';

interface AboutComponentProps {
  onBack?: () => void;
}

const AboutComponent: React.FC<AboutComponentProps> = () => {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="cart-page">
      {/* HERO HEADER - Matches Cart & Checkout Pages */}
      <header className="cart-hero">
        <div className="cart-hero-content animate-fade-in-up">
          <span style={{ backgroundColor: '#FEF2F2', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 14px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-block', marginBottom: '0.75rem' }}>
            BRAND STORY & HERITAGE
          </span>
          <h1 className="cart-title">
            About Candy Kids (Candy Garments)
          </h1>
          <p className="cart-subtitle">
            "Change Your LifeStyle with Candy Kids" • Premium Couture & Luxury Garments
          </p>
        </div>
      </header>

      <div className="cart-container" style={{ maxWidth: '1040px' }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ maxWidth: '760px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.7 }}>
            Candy Kids (Candy Garments) is a rapidly growing Pakistani retail brand specializing in high-end luxury and couture fashion for Girls, Kids, and Ladies. Established in 2023, we have quickly become a recognized name in the industry, known for delivering premium quality garments that combine traditional craftsmanship with modern, trendy designs. Our mission is to offer fashionable, comfortable, and elegant clothing that allows you to express your unique style with confidence.
          </p>
        </div>

        {/* --- OUR CRAFTSMANSHIP & VALUES --- */}
        <div ref={addToRefs} className="reveal-block" style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem' }}>Pillars of Excellence</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <Crown size={32} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Premium Fabric Purity</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>100% skin-safe, breathable cotton lawn, silks, and cozy knits engineered for active children.</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <Scissors size={32} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Precision Tailoring</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>Handcrafted seams, durable stitching, and comfortable elastic fits tailored specifically to kids' growth stages.</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <Sparkles size={32} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Modern Editorial Style</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>Inspired by international retail trends, featuring vibrant hues, playful prints, and elegant formal edits.</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <Heart size={32} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Customer First</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>Direct WhatsApp support, easy 7-day exchanges, and nationwide TCS Express Courier delivery to your doorstep.</p>
            </div>
          </div>
        </div>

        {/* --- PHILOSOPHY & HELPLINE --- */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Get in Touch with Our Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Have questions about sizing, orders, or custom requests? We are here to help 24/7!</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:03311498773" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
              Call Helpline 1: 0331-1498773
            </a>
            <a href="tel:03341495788" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
              Call Helpline 2: 0334-1495788
            </a>
            <a href="whatsapp://send?phone=923311498773&text=Assalamu%20Alaikum%20Candy%20Kids" className="btn btn-whatsapp" style={{ fontSize: '0.9rem' }}>
              WhatsApp Direct Order
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutComponent;