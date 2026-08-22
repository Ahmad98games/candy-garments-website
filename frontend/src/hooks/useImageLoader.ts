import { useState, useEffect, useCallback, useMemo } from 'react';
// Assuming the Global Loading Manager file is named 'GlobalLoadingManager.ts'
// Import the Global Loading Manager for integration
import { loadingManager } from '../lib/loadingManager'; 

// --- FIXED Type for internal consistency ---
// Use a generic EventListener type that works for both onload and onerror
// without explicitly defining the 'this' context, which causes issues with the browser's native types.
type ImageHandler = (ev: Event | string) => any;


// -------------------------------------------------------------------
// 🖼️ useImageLoader: Multiple Images
// -------------------------------------------------------------------

/**
 * Tracks the loading state of multiple images.
 * Uses the native Image object and Promise.all to load images outside the DOM efficiently.
 * Notifies the global loading manager upon completion.
 * * @param imageUrls - Array of image URLs to track
 * @returns Boolean indicating if images are still loading
 */
export function useImageLoader(imageUrls: string[]): boolean {
    const [loading, setLoading] = useState(true);
    const [loadedCount, setLoadedCount] = useState(0);

    // Creates a stable dependency key from the array content.
    const urlsKey = useMemo(() => imageUrls.join(','), [imageUrls]);

    useEffect(() => {
        // --- Setup and Cleanup Flags ---
        let isMounted = true;
        
        // Array to hold references to Image objects for cleanup
        const activeImages: HTMLImageElement[] = [];

        if (imageUrls.length === 0) {
            setLoading(false);
            loadingManager.finishImageLoading(); 
            return;
        }

        setLoading(true);
        setLoadedCount(0);

        // --- Loading Logic ---
        const imagePromises = imageUrls.map((url) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                activeImages.push(img); // Track the image for cleanup
                
                // Define the completion handler once. We ignore the 'this' context here 
                // as it's not strictly needed for the logic and fixes the TypeScript error.
                const handleCompletion: ImageHandler = () => {
                    if (isMounted) {
                        setLoadedCount(prev => prev + 1);
                        resolve();
                    }
                    // Crucial: remove listeners to prevent memory leaks.
                    img.onload = null;
                    img.onerror = null;
                };

                // Type assertion is often required here to satisfy different environment definitions
                // of the onerror handler, which might expect Event | string.
                img.onload = handleCompletion as (this: GlobalEventHandlers, ev: Event) => any;
                img.onerror = handleCompletion as (this: GlobalEventHandlers, ev: Event | string) => any;
                
                // Start loading the image
                img.src = url;
            });
        });

        // Wait for all images (or errors) to resolve
        Promise.all(imagePromises).then(() => {
            if (isMounted) {
                setLoading(false);
                // 🚨 Notify Global Loading Manager
                loadingManager.finishImageLoading();
            }
        });
        
        // --- Effect Cleanup ---
        return () => { 
            isMounted = false; 
            
            // Explicitly detach all listeners on cleanup
            activeImages.forEach(img => {
                img.onload = null;
                img.onerror = null;
            });
        };
        
    }, [urlsKey]); // Depend only on the stable URLs key

    return loading;
}

// -------------------------------------------------------------------
// 🖼️ useSingleImageLoader: Single Image
// -------------------------------------------------------------------

/**
 * Tracks a single image loading state.
 * Returns object with loading state and handlers suitable for direct use on an <img> tag.
 */
export function useSingleImageLoader() {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Use useCallback to ensure stable function references for component props.
    const handleLoad = useCallback(() => setImageLoaded(true), []);
    // Treat error the same as load to render content/fallback immediately.
    const handleError = useCallback(() => setImageLoaded(true), []); 

    const reset = useCallback(() => setImageLoaded(false), []);

    return {
        imageLoaded,
        handleLoad,
        handleError,
        reset,
    };
}