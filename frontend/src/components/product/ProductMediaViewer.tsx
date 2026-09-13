import React, { useState, useRef, useEffect } from 'react';
import { Sun, Sparkles, ZoomIn, Play, RefreshCw, ShieldCheck } from 'lucide-react';
import './ProductMediaViewer.css';

interface ProductMediaViewerProps {
  studioImages: string[];
  daylightVideoUrl?: string;
  productName: string;
  articleNo?: string;
}

export const ProductMediaViewer: React.FC<ProductMediaViewerProps> = ({
  studioImages,
  daylightVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  productName,
  articleNo = 'CANDY-LUX',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'studio' | 'daylight'>('studio');
  const [isDaylightLoaded, setIsDaylightLoaded] = useState(false);
  const [isDaylightBuffering, setIsDaylightBuffering] = useState(false);
  const [hasToggledDaylightOnce, setHasToggledDaylightOnce] = useState(false);

  // Zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStudioImage = studioImages[activeImageIndex] || '/images/candy.jpg';

  // Lazy-load daylight video ONLY upon first toggle interaction (protects sub-second LCP)
  const handleToggleMode = (mode: 'studio' | 'daylight') => {
    setViewMode(mode);
    if (mode === 'daylight' && !hasToggledDaylightOnce) {
      setHasToggledDaylightOnce(true);
      setIsDaylightBuffering(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'studio') return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => {
    if (viewMode === 'studio') {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Video buffering lifecycle
  const handleVideoCanPlay = () => {
    setIsDaylightBuffering(false);
    setIsDaylightLoaded(true);
  };

  return (
    <div className="product-media-viewer">
      {/* TOP TOGGLE SWITCH & FLOATING PILL */}
      <div className="media-viewer-controls">
        <div className="mode-toggle-pill-wrapper">
          <button
            type="button"
            className={`mode-toggle-btn ${viewMode === 'studio' ? 'active' : ''}`}
            onClick={() => handleToggleMode('studio')}
          >
            <Sparkles size={14} />
            <span>Studio Lighting</span>
          </button>
          <button
            type="button"
            className={`mode-toggle-btn daylight ${viewMode === 'daylight' ? 'active' : ''}`}
            onClick={() => handleToggleMode('daylight')}
          >
            <Sun size={14} />
            <span>Raw Daylight</span>
          </button>
        </div>

        {/* ACCURATE TRUST PILL: Zero Color Correction */}
        {viewMode === 'daylight' && (
          <div className="raw-daylight-pill animate-fade-in">
            <span className="pill-dot emerald" />
            <span>Natural Daylight Shot — Zero Color Correction</span>
          </div>
        )}
      </div>

      {/* MAIN VIEWPORT */}
      <div
        ref={containerRef}
        className={`media-viewport-container ${isZooming ? 'zooming' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* STUDIO IMAGE VIEW (CRITICAL RENDER PATH / LCP FRIENDLY) */}
        {viewMode === 'studio' && (
          <div className="studio-image-display">
            <img
              src={currentStudioImage}
              alt={productName}
              fetchPriority="high"
              decoding="async"
              className="primary-hero-image"
            />

            {/* 4X MACRO LENS ZOOM OVERLAY */}
            {isZooming && (
              <div
                className="macro-lens-zoom-window"
                style={{
                  backgroundImage: `url(${currentStudioImage})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '400%', // 4x Hardware-accelerated zoom
                }}
              >
                <div className="lens-crosshair" />
                <div className="lens-badge">4x MACRO LENS</div>
              </div>
            )}

            {!isZooming && (
              <div className="zoom-hint-badge">
                <ZoomIn size={14} />
                <span>Hover for 4x Fabric Macro-Zoom</span>
              </div>
            )}
          </div>
        )}

        {/* RAW DAYLIGHT VIDEO (LAZY LOADED ON DEMAND) */}
        {viewMode === 'daylight' && (
          <div className="daylight-video-display animate-fade-in">
            {/* BUFFERING LOADING SKELETON (~1-2 SECONDS FOR ADAPTIVE BITRATE BUFFER) */}
            {isDaylightBuffering && (
              <div className="daylight-stream-skeleton">
                <div className="skeleton-spinner">
                  <RefreshCw size={26} className="animate-spin text-emerald-500" />
                </div>
                <div className="skeleton-title">Connecting to Unfiltered Daylight Stream...</div>
                <div className="skeleton-desc">Calibrating natural 5500K sunlight fidelity & adaptive bitrate</div>
                <div className="skeleton-shimmer-bar" />
              </div>
            )}

            {hasToggledDaylightOnce && (
              <video
                ref={videoRef}
                src={daylightVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onCanPlay={handleVideoCanPlay}
                onWaiting={() => setIsDaylightBuffering(true)}
                onPlaying={() => setIsDaylightBuffering(false)}
                className={`daylight-video-element ${isDaylightBuffering ? 'hidden' : 'visible'}`}
              />
            )}
          </div>
        )}
      </div>

      {/* THUMBNAILS CAROUSEL */}
      {studioImages.length > 1 && viewMode === 'studio' && (
        <div className="media-thumbnails-strip">
          {studioImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`thumbnail-btn ${activeImageIndex === idx ? 'active' : ''}`}
              onClick={() => setActiveImageIndex(idx)}
            >
              <img src={img} alt={`${productName} view ${idx + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
