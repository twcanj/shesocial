/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SheSocial luxury color palette
        primary: {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fcdac0',
          300: '#f9c095',
          400: '#f59e68',
          500: '#f18444',
          600: '#e26d2b',
          700: '#bc5424',
          800: '#954426',
          900: '#783922',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
        },
        luxury: {
          gold: '#d4af37',
          rose: '#f4c2c2',
          champagne: '#f7e7ce',
          pearl: '#faf0e6',
          platinum: '#e5e4e2',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        'serif': ['Noto Serif TC', 'Georgia', 'serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'luxury': '0 10px 25px -3px rgba(212, 175, 55, 0.1), 0 4px 6px -2px rgba(212, 175, 55, 0.05)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-luxury': 'pulseLuxury 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseLuxury: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' 
          },
        },
      },
    },
  },
  plugins: [],
}