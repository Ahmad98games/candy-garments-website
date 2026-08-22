import React, { CSSProperties } from 'react';

// Assuming you have a global CSS file defining:
// .product-card, .skeleton-card
// .product-info
// .skeleton-pulse (for the animation)
// .skeleton-text, .skeleton-text.short, .skeleton-text.button

/**
 * Utility to apply the common pulse animation and background to a skeleton block.
 * @param props - CSSProperties to merge with the skeleton base styles.
 */
const SkeletonBlock: React.FC<{ style?: CSSProperties, className?: string }> = ({ style, className = '' }) => {
    return (
        <div 
            className={`skeleton-pulse ${className}`} 
            style={{ 
                borderRadius: '4px',
                ...style 
            }}
        />
    );
}

/**
 * SkeletonProductCard Component
 * * Displays a loading placeholder mimicking the structure of a product card.
 * * Uses CSS classes for the pulse animation and visual styling.
 */
const SkeletonProductCard: React.FC = () => {
    return (
        <div className="product-card skeleton-card">
            {/* 1. Image Placeholder */}
            <SkeletonBlock 
                className="skeleton-image"
                style={{ height: '300px', marginBottom: '16px' }} 
            />
            
            <div className="product-info">
                {/* 2. Product Name/Title Placeholder */}
                <SkeletonBlock 
                    className="skeleton-text"
                    style={{ height: '20px', width: '90%', marginBottom: '10px' }} 
                />
                
                {/* 3. Price/Category Placeholder */}
                <SkeletonBlock 
                    className="skeleton-text short"
                    style={{ height: '18px', width: '50%', marginBottom: '15px' }} 
                />
                
                {/* 4. Add to Cart Button Placeholder */}
                <SkeletonBlock 
                    className="skeleton-text button"
                    style={{ width: '100%', height: '40px' }}
                />
            </div>
        </div>
    );
};

export default SkeletonProductCard;