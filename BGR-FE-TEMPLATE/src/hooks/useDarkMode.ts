import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'dark' | 'light' | 'system';

/**
 * Custom hook for managing dark mode/theme
 * @returns [theme, setTheme]
 */
export function useDarkMode(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Listen for changes in system theme preferences
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return [theme, setTheme];
}
