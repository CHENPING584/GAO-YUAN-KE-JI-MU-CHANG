/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plateau: {
          50: '#f3fbf7',
          100: '#dcf4e6',
          200: '#bbe8d1',
          300: '#8fd7b4',
          400: '#5fc191',
          500: '#3da875',
          600: '#2d855c',
          700: '#266b4b',
          800: '#22553d',
          900: '#1d4633',
        },
        earth: {
          950: '#0f1720',
        },
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 32, 0.08)',
      },
      backgroundImage: {
        'plateau-grid':
          'radial-gradient(circle at 1px 1px, rgba(61, 168, 117, 0.18) 1px, transparent 0)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
