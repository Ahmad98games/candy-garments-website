import React from 'react';
import { useMinimumLoadingTime } from '../hooks/useMinimumLoadingTime';
import './LoadingWrapper.css';

interface LoadingWrapperProps {
    children: React.ReactNode;
    isLoading: boolean;
    skeleton: React.ReactNode;
    minDisplayTime?: number; // Defaults to 400ms
    className?: string;
}

export default function LoadingWrapper({
    children,
    isLoading,
    skeleton,
    minDisplayTime = 400,
    className = '',
}: LoadingWrapperProps) {
    const shouldDisplaySkeleton = useMinimumLoadingTime(isLoading, minDisplayTime);

    // Common container to prevent layout shifts
    const wrapperClass = `loading-wrapper ${className}`;

    if (shouldDisplaySkeleton) {
        return (
            <div className={wrapperClass} aria-busy="true">
                {skeleton}
            </div>
        );
    }

    return (
        // Added 'content-revealed' for CSS animation
        <div className={`${wrapperClass} content-revealed`} aria-busy="false">
            {children}
        </div>
    );
}