import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import LoadingWrapper from '../components/LoadingWrapper';
import './OmnoraPosterGallery.css';

interface Poster {
    id: number;
    image: string;
    alt: string;
    title: string;
    category: string;
}

const posters: Poster[] = [
    { id: 1, image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80', alt: 'Velvet Archive', title: 'The Royal Velvet Archive', category: 'High Couture 2026' },
    { id: 2, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', alt: 'Pure Raw Silk', title: 'Mah-ru Pure Silk Pret', category: 'Handwoven Silk' },
    { id: 3, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', alt: 'Master Zardozi', title: 'Zardozi & Antique Tilla', category: 'Artisanal Needlework' },
    { id: 4, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', alt: 'Giza Cotton Lawn', title: 'Lumière Schiffli Cutwork', category: 'Unstitched Lawn' },
    { id: 5, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', alt: 'Organza & Tissue', title: 'Artisanal Tissue Saree', category: 'Heirloom Formals' },
];

export default function PosterGallery() {
    const [isLoading, setIsLoading] = useState(true);
    const [heroPoster, ...gridPosters] = posters;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const GallerySkeleton = () => (
        <div className="gallery-grid-magnum skeleton-pulse">
            <div className="skeleton-block hero-skeleton" />
            <div className="gallery-sub-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-block sub-skeleton" />
                ))}
            </div>
        </div>
    );

    return (
        <section className="gallery-magnum">
            <div className="gallery-noise" />

            <div className="container">
                {/* HEADER */}
                <div className="gallery-header-magnum">
                    <h2 className="gallery-title">
                        <span>LOOKBOOK EXHIBITION</span>
                        The Atelier Campaign
                    </h2>
                    <div className="gallery-meta">
                        <p>
                            A visual exhibition of Omnora Couture's flagship editorial collections.
                            Exploring the harmony of South Asian heritage and high-fashion luxury.
                        </p>
                    </div>
                </div>

                {/* LOADING WRAPPER INTEGRATION */}
                <LoadingWrapper
                    isLoading={isLoading}
                    skeleton={<GallerySkeleton />}
                    minDisplayTime={400}
                >
                    <div className="gallery-grid-magnum animate-entry">

                        {/* LEFT: HERO POSTER */}
                        <div className="poster-artifact poster-hero">
                            <div className="artifact-img-wrapper">
                                <img
                                    src={heroPoster.image}
                                    alt={heroPoster.alt}
                                    className="artifact-img"
                                    loading="lazy"
                                />
                                <div className="artifact-overlay">
                                    <div className="overlay-header">
                                        <span className="artifact-id">NO. 0{heroPoster.id}</span>
                                        <span className="artifact-cat">{heroPoster.category}</span>
                                    </div>
                                    <div className="overlay-footer">
                                        <h3 className="artifact-title">{heroPoster.title}</h3>
                                        <button className="artifact-btn" aria-label="View Details">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SUB GRID */}
                        <div className="gallery-sub-grid">
                            {gridPosters.map((poster) => (
                                <div key={poster.id} className="poster-artifact">
                                    <div className="artifact-img-wrapper">
                                        <img
                                            src={poster.image}
                                            alt={poster.alt}
                                            className="artifact-img"
                                            loading="lazy"
                                        />
                                        <div className="artifact-overlay">
                                            <span className="artifact-id">0{poster.id}</span>
                                            <h3 className="artifact-title small">{poster.title}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </LoadingWrapper>
            </div>
        </section>
    );
};