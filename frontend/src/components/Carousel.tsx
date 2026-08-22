import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './OmnoraCarousel.css';

const slides = [
    {
        id: 'slide-01',
        src: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80",
        title: "Royal Velvet Velvet Couture",
        badge: "Winter Formals 2026",
        desc: "Hand-crafted zardozi and antique tilla threadwork on pure plush micro-velvet."
    },
    {
        id: 'slide-02',
        src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
        title: "Mah-ru Silk pret",
        badge: "Luxury Ready-To-Wear",
        desc: "Tailored 80g pure raw silk co-ord ensembles featuring pearl drop embellishments."
    },
    {
        id: 'slide-03',
        src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
        title: "Lumière Schiffli Edition",
        badge: "Unstitched Luxury Lawn",
        desc: "Giza cotton lawn shirts featuring delicate cutwork schiffli and digitally printed silk dupattas."
    }
];

const AUTOPLAY_DURATION = 5000;

const Carousel = () => {
    const [current, setCurrent] = useState(0);

    // Simplified Logic: No complex intervals for progress bar
    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // AutoPlay Logic
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, AUTOPLAY_DURATION);

        return () => clearInterval(timer);
    }, [current]);

    return (
        <div className="carousel-magnum">
            {/* Slides Layer */}
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`magnum-slide ${idx === current ? 'active' : ''}`}
                >
                    <div className="magnum-image-wrapper">
                        <img src={slide.src} alt={slide.title} className="magnum-img" />
                    </div>

                    <div className="magnum-content">
                        <span className="magnum-badge">{slide.badge}</span>
                        <h2 className="magnum-title">{slide.title}</h2>
                        <p className="magnum-desc">{slide.desc}</p>
                    </div>
                </div>
            ))}

            {/* Controls Layer */}
            <div className="magnum-controls">
                <div className="magnum-counter">
                    {String(current + 1).padStart(2, '0')}
                    <span>/ {String(slides.length).padStart(2, '0')}</span>
                </div>

                <button className="nav-btn" onClick={prevSlide} aria-label="Previous Slide">
                    <ArrowLeft size={20} />
                </button>
                <button className="nav-btn" onClick={nextSlide} aria-label="Next Slide">
                    <ArrowRight size={20} />
                </button>
            </div>

            {/* Progress Bar - CSS Driven */}
            <div className="magnum-progress-container">
                {/* TRICK: adding 'key={current}' forces React to destroy and recreate 
                   this div every time the slide changes. This resets the CSS animation automatically.
                */}
                <div
                    key={current}
                    className="magnum-progress-bar"
                    style={{ animationDuration: `${AUTOPLAY_DURATION}ms` }}
                />
            </div>
        </div>
    );
};

export default Carousel;