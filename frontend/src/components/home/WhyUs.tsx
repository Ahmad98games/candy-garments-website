import React from 'react';
import '../../pages/Home.css';

export default function WhyUs() {
    return (
        <section className="why-us">
            <div className="container">
                <div className="why-us-content">
                    <h2>Why Choose Omnora Couture?</h2>
                    <p>We preserve traditional South Asian needlework heritage and pure natural weaving standards to craft garments of regal elegance and everlasting grace.</p>

                    <div className="why-us-features">
                        <div className="why-feature">
                            <h4>Master Karigar Needlework</h4>
                            <p>Hand-crafted zardozi, dabka, resham, and tilla embroidery crafted by veteran artisans.</p>
                        </div>
                        <div className="why-feature">
                            <h4>100% Pure Silks & Lawn</h4>
                            <p>Authentic 80g pure raw silk, Giza cotton lawn, organza, and plush micro-velvet fabrics.</p>
                        </div>
                        <div className="why-feature">
                            <h4>Bespoke Tailoring & Fitting</h4>
                            <p>Custom stitching available with personalized measurements for a flawless silhouette.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
