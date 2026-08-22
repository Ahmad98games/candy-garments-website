import React from 'react';
import { Quote, Star, MapPin } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
    {
        id: 1,
        text: "Absolutely in love with my Noor-e-Zari velvet suit! The zardozi needlework is breathtaking and the custom fitting by master karigars was spot on.",
        author: "Sarah K.",
        location: "Lahore",
        rating: 5
    },
    {
        id: 2,
        text: "The raw silk quality is unmatched! The fabric is 100% pure 80g raw silk and the pearl detailing gave it such an opulent finish for my sister's wedding.",
        author: "Ayesha M.",
        location: "Karachi",
        rating: 5
    },
    {
        id: 3,
        text: "Best couture atelier in Pakistan! Shipped via DHL Express to London in just 4 days. The embroidered organza dupatta is pure luxury.",
        author: "Fatima R.",
        location: "London, UK",
        rating: 5
    }
];

export default function Testimonials() {
    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                
                {/* --- HEADER --- */}
                <div className="section-header">
                    <span className="section-tag">BOUTIQUE CLIENTELE</span>
                    <h2 className="section-title">
                        Client <span className="highlight-text">Testimonials</span>
                    </h2>
                    <p className="section-subtitle">
                        Real reviews from patrons who wear Omnora Couture worldwide.
                    </p>
                </div>

                {/* --- GRID --- */}
                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card">
                            {/* Ambient Quote Icon */}
                            <div className="quote-icon-bg">
                                <Quote size={60} strokeWidth={1} />
                            </div>

                            <div className="card-content">
                                {/* Stars */}
                                <div className="stars">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#ffd600" stroke="none" />
                                    ))}
                                </div>

                                <p className="testimonial-text">"{t.text}"</p>

                                <div className="testimonial-footer">
                                    <div className="author-avatar">
                                        {t.author.charAt(0)}
                                    </div>
                                    <div className="author-info">
                                        <span className="author-name">{t.author}</span>
                                        <span className="author-location">
                                            <MapPin size={12} /> {t.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}