/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#14161A',
          soft: '#4A4F59',
          faint: '#8A909C',
        },
        paper: '#FFFFFF',
        surface: '#F6F7FA',
        line: '#E4E7ED',
        brand: {
          50: '#EEF3FE',
          100: '#DCE8FD',
          200: '#B4CCFA',
          400: '#5C86EE',
          500: '#2C5CE0',
          600: '#2148C4',
          700: '#1A399E',
          900: '#12275F',
        },
        success: { DEFAULT: '#1E8E5A', bg: '#E9F7EF' },
        warning: { DEFAULT: '#B7791F', bg: '#FCF3E3' },
        danger: { DEFAULT: '#D92D20', bg: '#FDEDEC' },
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 22, 26, 0.04), 0 1px 0 rgba(20, 22, 26, 0.03)',
        pop: '0 12px 32px rgba(20, 22, 26, 0.12)',
      },
      maxWidth: {
        content: '1240px',
      },
    },
  },
  plugins: [],
}
