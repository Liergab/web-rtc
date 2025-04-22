import { useState, useEffect } from 'react';

/**
 * Custom hook for media queries
 * @param query - Media query string e.g. '(min-width: 768px)'
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback for changes
    const handleResize = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for changes
    mediaQuery.addEventListener('change', handleResize);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  '3xl': '(min-width: 1920px)',
};

/**
 * Hook with predefined breakpoints
 * Usage: const isDesktop = useBreakpoint('lg');
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  return useMediaQuery(breakpoints[breakpoint]);
}
