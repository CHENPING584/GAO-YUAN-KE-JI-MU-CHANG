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
    },
  },
  plugins: [],
};
