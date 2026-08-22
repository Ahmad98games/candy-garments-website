import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.1) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    element.classList.add('is-visible');
                    observer.unobserve(element); // Animate once
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px' // Trigger when 50px into view
            }
        );

        // Add base class for CSS targeting
        element.classList.add('reveal-on-scroll');

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [threshold]);

    return ref;
}