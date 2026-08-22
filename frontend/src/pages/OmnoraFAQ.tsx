import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShieldAlert, Mail } from 'lucide-react';
import './OmnoraFAQ.css';

const Footer = () => (
  <footer className="footer-magnum">
    <div className="container">
      &copy; {new Date().getFullYear()} Omnora Couture Atelier. All rights reserved. <br />
      <span className="footer-credit">Handcrafted Couture & Bespoke Tailoring</span>
    </div>
  </footer>
);

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is included in an Unstitched Luxury suit?",
      answer: "Each unstitched suit includes front, back, and sleeve fabric panels, an embroidered neckline patch, sleeve borders, hem organza borders, and a fully finished dupatta (organza, medium silk, or chiffon) along with matching trousers fabric."
    },
    {
      question: "Do you offer Custom Stitching and tailored sizing?",
      answer: "Yes! Our master karigars offer custom stitching for +PKR 3,500 per suit. You can select standard sizes (XS to XL) or provide custom shoulder, bust, waist, and length measurements during checkout."
    },
    {
      question: "How should I care for hand-embroidered velvet and pure silk garments?",
      answer: "We strongly recommend professional dry cleaning only for all hand-embroidered velvet, raw silk, tissue, and chiffon garments. Avoid direct ironing on zardozi and tilla threadwork."
    },
    {
      question: "What are your domestic shipping timelines and payment methods?",
      answer: "Unstitched and pret orders dispatch within 2-3 business days nationwide exclusively via TCS Express Courier upon receipt of 100% advance bank transfer. No Cash on Delivery (COD) available."
    },
    {
      question: "What is your Returns & Exchange Policy for couture wear?",
      answer: (
        <>
          <p>Unstitched suits in original un-cut condition can be exchanged within 7 days. Please note:</p>
          <ol>
            <li>Custom stitched or altered suits cannot be returned unless damaged upon arrival.</li>
            <li>Contact Couture Concierge with your order details for authorization.</li>
            <li>Return shipping costs apply for exchange preferences.</li>
          </ol>
        </>
      )
    },
    {
      question: "How do I confirm my size before ordering?",
      answer: "Please refer to our detailed Size Guide on each product page or reach out to our WhatsApp Stylist (+92 300 0000000) for personal fitting assistance."
    }
  ];

  return (
    <div className="faq-magnum-page">
      <div className="noise-layer" />

      {/* HERO */}
      <header className="container faq-hero-magnum">
        <h1 className="hero-super-title">
          <span>ATELIER CONCIERGE</span>
          Frequently Asked<br />Questions
        </h1>
        <div className="hero-desc">
          Everything you need to know about fabric specifications, custom stitching, size fitting, and global dispatch.
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="container faq-layout">

        {/* SIDEBAR */}
        <aside>
          <div className="manifesto-card">
            <h3 className="manifesto-title">
              <ShieldAlert size={20} />
              Couture Guarantee
            </h3>

            <p className="manifesto-text">
              <strong>Artisanal Quality:</strong> Every garment is inspected by master karigars before dispatch to ensure 100% flawless embroidery and stitching.
            </p>

            <p className="manifesto-text">
              Our fashion stylists and tailors are available on WhatsApp for live measurement guidance.
            </p>

            <div className="manifesto-note">
              "Fine fabrics, regal needlework, and timeless Pakistani heritage."
              <br />
              <Link to="/contact" className="sidebar-link">
                Contact Stylist →
              </Link>
            </div>
          </div>

          <div className="breadcrumbs-sidebar">
            <Link to="/" className="crumb-link">Home</Link> / FAQ
          </div>
        </aside>

        {/* MAIN ACCORDION */}
        <main>
          <h2 className="faq-group-title">Stitching, Fabrics & Orders</h2>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item-magnum ${activeIndex === index ? 'active' : ''}`}>
                <button className="faq-trigger" onClick={() => toggleFAQ(index)}>
                  <span className="faq-q-text">{faq.question}</span>
                  <div className="faq-icon-box">
                    <Plus size={18} />
                  </div>
                </button>
                <div className="faq-content">
                  <div className="faq-inner">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CONTACT BLOCK */}
          <div className="contact-block">
            <h3 className="contact-title">Need Personal Fashion Assistance?</h3>
            <p className="contact-sub">
              Our master tailors and fashion consultants are available for live consultation.
            </p>

            <a href="mailto:omnorainfo28@gmail.com" className="btn-contact">
              <Mail size={16} style={{ marginRight: '8px' }} /> Email Couture Concierge
            </a>

            <div className="contact-meta">
              Direct Line: +92 3334355475 <br />
              (Mon-Sat, 1100h - 2100h PKT)
            </div>
          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
}