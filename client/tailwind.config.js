/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zodiac-inspired mystical luxury palette
        primary: {
          50: '#faf8ff',
          100: '#f0ecff',
          200: '#e0d9ff',
          300: '#c7b8ff',
          400: '#a88cff',
          500: '#8b5bff',
          600: '#663399', // Imperial Purple (main)
          700: '#5c2d85',
          800: '#4a2470',
          900: '#3d1f5c',
        },
        secondary: {
          50: '#fffef7', // Warm Ivory
          100: '#fefcf0',
          200: '#fef7e0',
          300: '#fef0cc',
          400: '#fde68a',
          500: '#fcd34d',
          600: '#b8860b', // Dark Gold (readable on white)
          700: '#d97706',
          800: '#92400e',
          900: '#1a1a1a', // Dark charcoal for excellent contrast
        },
        // Text colors for optimal readability
        text: {
          primary: '#1a1a1a',      // Dark charcoal - primary text
          secondary: '#4a4a4a',    // Medium gray - secondary text
          muted: '#6b7280',        // Light gray - muted text
          accent: '#663399',       // Imperial purple - accent text
          inverse: '#ffffff',      // White - for dark backgrounds
        },
        luxury: {
          // Zodiac mystical colors with better contrast
          'imperial': '#663399',    // Main brand color
          'imperial-dark': '#4a2470', // Darker purple for text
          'gold': '#b8860b',       // Dark Gold (readable)
          'gold-dark': '#b8860b',  // Darker gold for text
          'crimson': '#e73c28',    // Traditional red
          'crimson-dark': '#b91c1c', // Darker red for text
          'deep-blue': '#2465A8',  // Interactive elements
          'deep-blue-dark': '#1e3a8a', // Darker blue for text
          'ivory': '#fffef7',      // Background
          'purple-light': '#d1b2ff', // Light purple
          'purple-glow': '#8b5bff', // Glowing purple
          // Mystical gradients base colors
          'mystic-start': '#663399',
          'mystic-end': '#b8860b',
        },
        // Zodiac sign inspired tier colors
        tier: {
          'regular': '#b5c334',     // Taurus green
          'vip': '#ff9800',         // Leo orange  
          'premium': '#e91e63',     // Libra pink
          'platinum': '#673ab7',    // Scorpio purple
        },
        // Zodiac-inspired colorful card gradients
        zodiac: {
          'aries': { start: '#ff6f61', end: '#ffb199' },        // Coral to peach
          'taurus': { start: '#b5c334', end: '#e0ffb3' },       // Olive to light green
          'gemini': { start: '#ffa726', end: '#fff7b2' },       // Orange to cream (readable)
          'cancer': { start: '#00bcd4', end: '#b2f7ff' },       // Cyan to light blue
          'leo': { start: '#ff9800', end: '#ffe0b2' },          // Orange to light orange
          'virgo': { start: '#8bc34a', end: '#e6ffb2' },        // Green to light green
          'libra': { start: '#e91e63', end: '#ffb2d9' },        // Pink to light pink
          'scorpio': { start: '#673ab7', end: '#d1b2ff' },      // Purple to light purple
          'sagittarius': { start: '#2196f3', end: '#b2d7ff' },  // Blue to light blue
          'capricorn': { start: '#795548', end: '#d7c0b2' },    // Brown to light brown
          'aquarius': { start: '#00bfae', end: '#b2fff7' },     // Teal to light teal
          'pisces': { start: '#3f51b5', end: '#b2c7ff' },       // Indigo to light blue
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
        'luxury': '0 10px 25px -3px rgba(102, 51, 153, 0.15), 0 4px 6px -2px rgba(255, 215, 0, 0.1)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(102, 51, 153, 0.08)',
        'mystical': '0 0 20px rgba(102, 51, 153, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
        'mystical-glow': '0 0 8px rgba(255, 215, 0, 0.6)',
        'card-depth': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-luxury': 'pulseLuxury 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'mystical-glow': 'mysticalGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'card-flip': 'cardFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
            boxShadow: '0 0 0 0 rgba(102, 51, 153, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(102, 51, 153, 0)' 
          },
        },
        mysticalGlow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
            transform: 'scale(1)'
          },
          '50%': {
            filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.8))',
            transform: 'scale(1.02)'
          },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}