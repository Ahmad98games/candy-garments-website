import { useState, useEffect, useCallback } from 'react';

// -------------------------------------------------------------------
// 📝 TYPES AND INTERFACES
// -------------------------------------------------------------------

/**
 * Global Loading Manager Types
 * Defines the public interface and internal state structure.
 */

export type LoadingState = {
    /** True if data fetching (e.g., API calls) is in progress. */
    dataLoading: boolean;
    /** True if resource loading (e.g., images) is pending. */
    imagesLoading: boolean;
    /** True if the minimum required display time for the loader has passed. */
    minTimeElapsed: boolean;
};

export interface ILoadingManager {
    startLoading: () => void;
    finishDataLoading: () => void;
    finishImageLoading: () => void;
    /** Returns true if the app should still show a loading indicator. */
    isLoading: () => boolean;
    reset: () => void;
    /** Subscribes a listener function to state changes and returns an unsubscribe function. */
    subscribe: (listener: () => void) => () => void;
}

// -------------------------------------------------------------------
// ⚙️ IMPLEMENTATION
// -------------------------------------------------------------------

/**
 * GlobalLoadingManager
 * Manages the application's overall loading state, enforcing a minimum display time
 * for a smooth user experience (no "flash of content").
 */
class GlobalLoadingManager implements ILoadingManager {
    private state: LoadingState = {
        dataLoading: false,
        imagesLoading: false,
        minTimeElapsed: true, // Start in a ready state
    };

    private minDisplayTime: number = 300; // 300ms minimum display time
    private listeners: Set<() => void> = new Set();
    private minTimeTimeout: ReturnType<typeof setTimeout> | null = null; // To clear any pending timeout

    constructor(minTime: number = 300) {
        this.minDisplayTime = minTime;
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener());
    }

    /**
     * Initiates the loading sequence, resetting the minimum time counter.
     */
    public startLoading(): void {
        // 1. Clear any existing timeout
        if (this.minTimeTimeout) {
            clearTimeout(this.minTimeTimeout);
            this.minTimeTimeout = null;
        }

        // 2. Set initial state to loading
        this.state = {
            dataLoading: true,
            imagesLoading: true,
            minTimeElapsed: false, // Reset minimum time flag
        };
        this.notifyListeners();

        // 3. Set new timeout for the minimum display duration
        this.minTimeTimeout = setTimeout(() => {
            this.state.minTimeElapsed = true;
            // Notify again: If data/images finished while the timer was running, 
            // this second notification allows `isLoading()` to finally return false.
            this.notifyListeners(); 
        }, this.minDisplayTime);
    }

    /**
     * Signals that the core application data has finished fetching.
     */
    public finishDataLoading(): void {
        this.state.dataLoading = false;
        this.notifyListeners();
    }

    /**
     * Signals that all critical images or assets have finished loading.
     */
    public finishImageLoading(): void {
        this.state.imagesLoading = false;
        this.notifyListeners();
    }

    /**
     * Determines if the global loading indicator should still be visible.
     * The indicator is visible if:
     * 1. Data is still loading OR
     * 2. Images are still loading OR
     * 3. The minimum display time hasn't elapsed yet.
     */
    public isLoading(): boolean {
        return (
            this.state.dataLoading ||
            this.state.imagesLoading ||
            !this.state.minTimeElapsed
        );
    }

    /**
     * Immediately forces the manager into a non-loading state.
     */
    public reset(): void {
        if (this.minTimeTimeout) {
            clearTimeout(this.minTimeTimeout);
            this.minTimeTimeout = null;
        }
        
        this.state = {
            dataLoading: false,
            imagesLoading: false,
            minTimeElapsed: true,
        };
        this.notifyListeners();
    }

    /**
     * Adds a listener function to be called on state changes.
     * @param listener The function to execute on state change.
     * @returns An unsubscribe function.
     */
    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

// -------------------------------------------------------------------
// ⚡️ SINGLETON INSTANCE & REACT HOOK
// -------------------------------------------------------------------

// Singleton instance
// Export as a const to ensure type safety and clear intention.
export const loadingManager: ILoadingManager = new GlobalLoadingManager();


/**
 * useLoadingManager
 * React hook to consume the loading state from the global manager.
 * @returns boolean - True if the global loading indicator should be displayed.
 */
export function useLoadingManager(): boolean {
    const [loading, setLoading] = useState(() => loadingManager.isLoading());

    // Memoize the callback to ensure stable reference for the subscription
    const updateLoadingState = useCallback(() => {
        setLoading(loadingManager.isLoading());
    }, []);

    useEffect(() => {
        // Subscribe to state changes when component mounts
        const unsubscribe = loadingManager.subscribe(updateLoadingState);

        // Cleanup: unsubscribe when component unmounts
        return () => {
            unsubscribe();
        };
    }, [updateLoadingState]); // Dependency is stable due to useCallback

    return loading;
}

// Export the singleton instance for non-React contexts (e.g., API services)
export default loadingManager;