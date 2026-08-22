import React, { useState, useEffect, useCallback } from 'react';
import { FALLBACK_IMAGE } from '../constants'; // Ensure you have this constant
import './SmartImage.css';

interface SmartImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    aspectRatio?: string; // e.g., "4/5", "16/9"
    onLoad?: () => void;
    onError?: () => void;
    priority?: boolean;
}

export default function SmartImage({
    src,
    alt,
    className = '',
    style,
    aspectRatio = 'auto',
    onLoad,
    onError,
    priority = false,
}: SmartImageProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    // Reset status if the source changes (e.g., inside a carousel)
    useEffect(() => {
        setStatus('loading');
    }, [src]);

    const handleLoad = useCallback(() => {
        setStatus('loaded');
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setStatus('error');
        onError?.();
    }, [onError]);

    // Determine the final source
    const finalSrc = status === 'error' ? FALLBACK_IMAGE : src;

    return (
        <div
            className={`smart-image-container ${className}`}
            style={{ aspectRatio, ...style }}
        >
            {/* 1. The Skeleton Overlay */}
            <div
                className={`smart-skeleton ${status !== 'loading' ? 'hidden' : ''}`}
                aria-hidden="true"
            />

            {/* 2. The Real Image */}
            <img
                key={finalSrc} // Forces React to remount img if finalSrc changes to fallback
                src={finalSrc}
                alt={alt}
                className={`smart-img ${status !== 'loading' ? 'visible' : ''}`}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}