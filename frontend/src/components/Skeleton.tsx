import React, { memo } from 'react';
import './Skeleton.css';

/**
 * 🧱 SkeletonCard
 * Placeholder for the Product Card.
 * matches: aspect-[4/5] for image, title, price.
 */
export const SkeletonCard = memo(() => (
    <div className="skeleton-card">
        {/* Image Area with Shimmer */}
        <div className="skeleton-block image-ratio" />
        
        <div className="skeleton-content">
            {/* Title Line */}
            <div className="skeleton-block text-title" />
            
            {/* Price Line (shorter) */}
            <div className="skeleton-block text-price" />
        </div>
    </div>
));

/**
 * 📄 SkeletonProductDetail
 * Placeholder for the Product Detail Page.
 * Layout: 2 Columns (Image Left, Info Right)
 */
export const SkeletonProductDetail = memo(() => (
    <div className="skeleton-detail-container">
        
        {/* Left Column: Big Image */}
        <div className="skeleton-detail-image">
            <div className="skeleton-block full-height" />
        </div>
        
        {/* Right Column: Info */}
        <div className="skeleton-detail-info">
            {/* Breadcrumb */}
            <div className="skeleton-block text-short" style={{ width: '20%' }} />
            
            {/* Big Title */}
            <div className="skeleton-block text-h1" />
            
            {/* Price */}
            <div className="skeleton-block text-price-lg" />
            
            {/* Divider Gap */}
            <div style={{ height: '2rem' }} />

            {/* Description Lines */}
            <div className="skeleton-block text-line" />
            <div className="skeleton-block text-line" />
            <div className="skeleton-block text-line" style={{ width: '80%' }} />
            
            {/* Divider Gap */}
            <div style={{ height: '2rem' }} />

            {/* Add to Cart Button */}
            <div className="skeleton-block button-lg" />
        </div>
    </div>
));

/**
 * 🔢 SkeletonGrid
 * Helper to render X number of cards.
 * Usage: <SkeletonGrid count={8} />
 */
interface GridProps {
    count?: number;
}

export const SkeletonGrid = memo(({ count = 4 }: GridProps) => (
    <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
));

SkeletonCard.displayName = 'SkeletonCard';
SkeletonProductDetail.displayName = 'SkeletonProductDetail';
SkeletonGrid.displayName = 'SkeletonGrid';