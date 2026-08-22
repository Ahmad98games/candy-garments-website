import { useState, useEffect, useRef } from 'react';

export function useMinimumLoadingTime(isLoading: boolean, minDuration: number = 400): boolean {
    const [shouldShowSkeleton, setShouldShowSkeleton] = useState(isLoading);
    const startTimeRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isLoading) {
            // Loading started
            startTimeRef.current = Date.now();
            setShouldShowSkeleton(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else {
            // Loading finished - Check how much time passed
            if (startTimeRef.current) {
                const elapsedTime = Date.now() - startTimeRef.current;
                const remainingTime = minDuration - elapsedTime;

                if (remainingTime > 0) {
                    // If loaded too fast, wait for the remainder
                    timeoutRef.current = setTimeout(() => {
                        setShouldShowSkeleton(false);
                        startTimeRef.current = null;
                    }, remainingTime);
                } else {
                    // If loaded slow enough, hide immediately
                    setShouldShowSkeleton(false);
                    startTimeRef.current = null;
                }
            } else {
                setShouldShowSkeleton(false);
            }
        }

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isLoading, minDuration]);

    return shouldShowSkeleton;
}