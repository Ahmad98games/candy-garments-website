import React from 'react';
import './AdPlacement.css';

interface AdPlacementZoneProps {
    type: 'banner' | 'video' | 'sidebar' | 'square';
    config?: {
        enabled?: boolean;
        videoUrl?: string;
        imageUrl?: string;
        link?: string;
        alt?: string;
        title?: string;
        description?: string;
        posterImage?: string;
    };
    zoneName?: string;
    className?: string;
}

const AdPlacementZone: React.FC<AdPlacementZoneProps> = ({
    type,
    config = {},
    zoneName = 'Ad Zone',
    className = ''
}) => {
    // Don't render if explicitly disabled
    if (config.enabled === false) {
        return null;
    }

    const hasContent = config.videoUrl || config.imageUrl;

    // Video Zone
    if (type === 'video') {
        return (
            <div className={`ad-zone ad-zone-video ${className}`}>
                {config.videoUrl ? (
                    <div className="video-container">
                        {config.title && <h3 className="ad-zone-title">{config.title}</h3>}
                        {config.description && <p className="ad-zone-description">{config.description}</p>}
                        <video
                            controls
                            poster={config.posterImage}
                            className="ad-video"
                        >
                            <source src={config.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="ad-placeholder">
                        <div className="placeholder-icon">🎥</div>
                        <h4>{zoneName}</h4>
                        <p>Add your video URL in <code>adConfig.json</code></p>
                        <small>Supports: MP4, WebM</small>
                    </div>
                )}
            </div>
        );
    }

    // Banner Zone (full-width)
    if (type === 'banner') {
        return (
            <div className={`ad-zone ad-zone-banner ${className}`}>
                {config.imageUrl ? (
                    config.link ? (
                        <a href={config.link} target="_blank" rel="noopener noreferrer">
                            <img src={config.imageUrl} alt={config.alt || 'Banner'} className="ad-image" />
                        </a>
                    ) : (
                        <img src={config.imageUrl} alt={config.alt || 'Banner'} className="ad-image" />
                    )
                ) : (
                    <div className="ad-placeholder ad-placeholder-banner">
                        <div className="placeholder-icon">🖼️</div>
                        <h4>{zoneName}</h4>
                        <p>Add your banner image in <code>adConfig.json</code></p>
                        <small>Recommended: 1200x300px</small>
                    </div>
                )}
            </div>
        );
    }

    // Sidebar Zone
    if (type === 'sidebar') {
        return (
            <div className={`ad-zone ad-zone-sidebar ${className}`}>
                {config.imageUrl ? (
                    config.link ? (
                        <a href={config.link} target="_blank" rel="noopener noreferrer">
                            <img src={config.imageUrl} alt={config.alt || 'Ad'} className="ad-image" />
                        </a>
                    ) : (
                        <img src={config.imageUrl} alt={config.alt || 'Ad'} className="ad-image" />
                    )
                ) : (
                    <div className="ad-placeholder ad-placeholder-sidebar">
                        <div className="placeholder-icon">📢</div>
                        <h4>{zoneName}</h4>
                        <p>Add image in <code>adConfig.json</code></p>
                        <small>Recommended: 300x600px</small>
                    </div>
                )}
            </div>
        );
    }

    // Square Zone
    if (type === 'square') {
        return (
            <div className={`ad-zone ad-zone-square ${className}`}>
                {config.imageUrl ? (
                    config.link ? (
                        <a href={config.link} target="_blank" rel="noopener noreferrer">
                            <img src={config.imageUrl} alt={config.alt || 'Ad'} className="ad-image" />
                        </a>
                    ) : (
                        <img src={config.imageUrl} alt={config.alt || 'Ad'} className="ad-image" />
                    )
                ) : (
                    <div className="ad-placeholder ad-placeholder-square">
                        <div className="placeholder-icon">🎯</div>
                        <h4>{zoneName}</h4>
                        <p>Add image in <code>adConfig.json</code></p>
                        <small>Recommended: 300x300px</small>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default AdPlacementZone;
