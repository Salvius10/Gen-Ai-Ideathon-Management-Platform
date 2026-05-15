/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#dbeaff',
          100: '#bdd8ff',
          200: '#97c1ff',
          300: '#6faeff',
          400: '#5e9eff',
          500: '#3b6fe0',
          600: '#1a00d9',
          700: '#1500b8',
          800: '#100096',
          900: '#0b0075',
        },
        accent: {
          50: '#fff4ed',
          100: '#ffe4cc',
          200: '#ffc89a',
          300: '#ffa568',
          400: '#fe8336',
          500: '#fe6e06',
          600: '#e05400',
          700: '#b84000',
          800: '#943200',
          900: '#752800',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
