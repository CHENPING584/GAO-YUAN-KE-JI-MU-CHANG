/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plateau: {
          50: '#f4f7f4',
          100: '#e5eee6',
          200: '#ceddcf',
          300: '#adc2af',
          400: '#85a188',
          500: '#648268', // 莫兰迪绿：稳重且高级
          600: '#4e6752',
          700: '#3f5242',
          800: '#344336',
          900: '#2c372e',
          950: '#171d18',
        },
        gold: {
          50: '#fffcf2',
          400: '#e6c35c',
          500: '#d4af37', // 藏金：代表品质与珍稀
          600: '#b8932e',
        },
        slate: {
          950: '#0a0f0d', // 极深灰绿背景
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Inter"', '"PingFang SC"', 'sans-serif'],
      },
      backgroundImage: {
        'plateau-mesh': 'radial-gradient(at 0% 0%, rgba(100, 130, 104, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(212, 175, 55, 0.08) 0px, transparent 50%)',
        'plateau-grid': 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.15)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        }
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal': 'reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
