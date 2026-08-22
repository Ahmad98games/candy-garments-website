import React from 'react';
import '../../pages/Home.css'; // Make sure styling is applied from here

export default function HowItWorks() {
    return (
        <section className="how-it-works-section">
            {/* Background Ambient Glows for Ethereal Feel */}
            <div className="ambient-glow glow-left"></div>
            <div className="ambient-glow glow-right"></div>

            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Simple Process</span>
                    <h2>How It Works</h2>
                    <p>Three simple steps to your perfect, cinematic shower aromatherapy experience.</p>
                </div>

                <div className="steps-grid">
                    {/* Step 1 */}
                    <div className="step-card">
                        <div className="step-content">
                            <div className="step-number">01</div>
                            <h3>Choose Your Scent</h3>
                            <p>Browse our aromatherapy collection and pick the perfect scent for your shower ritual.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="step-card">
                        <div className="step-content">
                            <div className="step-number">02</div>
                            <h3>Place Order</h3>
                            <p>Secure checkout with Cash on Delivery available nationwide.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="step-card">
                        <div className="step-content">
                            <div className="step-number">03</div>
                            <h3>Relax & Enjoy</h3>
                            <p>Receive your package and indulge in a luxurious spa experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}