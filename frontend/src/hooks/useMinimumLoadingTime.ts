import { useState, useEffect } from 'react';

/**
 * Enforces a minimum loading time to prevent skeleton flashing on fast networks.
 * Similar to how YouTube/Amazon handle loading states.
 * 
 * @param actualLoading - The actual loading state from API/data fetching
 * @param minDisplayTime - Minimum time to display loading state (default 300ms)
 * @returns Display loading state that respects minimum time
 */
export function useMinimumLoadingTime(
    actualLoading: boolean,
    minDisplayTime: number = 300
): boolean {
    const [displayLoading, setDisplayLoading] = useState(true);
    const [startTime] = useState(() => Date.now());

    useEffect(() => {
        if (!actualLoading) {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDisplayTime - elapsed);

            if (remaining > 0) {
                const timer = setTimeout(() => {
                    setDisplayLoading(false);
                }, remaining);

                return () => clearTimeout(timer);
            } else {
                setDisplayLoading(false);
            }
        }
    }, [actualLoading, startTime, minDisplayTime]);

    return displayLoading;
}
