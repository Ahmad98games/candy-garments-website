import React from 'react';
import '../../pages/Home.css';

export default function TrustSection() {
    return (
        <section className="trust-section">
            <div className="container">
                <div className="trust-grid">
                    <div className="trust-item">
                        <div className="trust-icon">✓</div>
                        <h3>100% Natural</h3>
                        <p>Handcrafted with pure, natural ingredients</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">🌿</div>
                        <h3>Cruelty-Free</h3>
                        <p>No animal testing, ethical sourcing</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">🚚</div>
                        <h3>Fast Shipping</h3>
                        <p>2-3 day delivery to your doorstep</p>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">💯</div>
                        <h3>100% Satisfaction</h3>
                        <p>Money-back guarantee on all products</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
