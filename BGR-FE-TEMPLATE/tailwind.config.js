/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vulcan': {
          50: 'var(--color-vulcan-50)',
          100: 'var(--color-vulcan-100)',
          200: 'var(--color-vulcan-200)',
          300: 'var(--color-vulcan-300)',
          400: 'var(--color-vulcan-400)',
          500: 'var(--color-vulcan-500)',
          600: 'var(--color-vulcan-600)',
          700: 'var(--color-vulcan-700)',
          800: 'var(--color-vulcan-800)',
          900: 'var(--color-vulcan-900)',
        },
        'hey': {
          100: 'var(--color-hey-100)',
        },
        'avocado': {
          200: 'var(--color-avocado-200)',
          300: 'var(--color-avocado-300)',
          400: 'var(--color-avocado-400)',
          500: 'var(--color-avocado-500)',
          600: 'var(--color-avocado-600)',
        },
      },
      fontFamily: {
        'inter': ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
} 