/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // StockMate Professional Restaurant Inventory SaaS Design Tokens
        brand: {
          primary: '#075E4B',    // Primary deep green
          secondary: '#087F8C',  // Secondary teal
          hover: '#054638',
          light: '#E6F3F0',
          dark: '#04382D',
          surface: '#FFFFFF',
          pageBg: '#F7F9FC',
          border: '#DCE5EF',
        },
        inventory: {
          healthy: '#15803D',    // Healthy stock / Success
          low: '#D97706',        // Warning / Low stock
          out: '#DC2626',        // Error / Out of stock
          border: '#DCE5EF',     // Table borders and dividers
          bg: '#F7F9FC',         // Page background
          surface: '#FFFFFF',    // White surfaces
        },
        forest: {
          50: '#F0F9F6',
          100: '#E1F2EC',
          200: '#C2E5D9',
          300: '#94D1C0',
          400: '#54B39A',
          500: '#20967A',
          600: '#0E7A62',
          700: '#0B6B55',
          800: '#075E4B',        // Primary deep green
          900: '#054638',
          950: '#04382D',
        },
        emerald: {
          50: '#F0F9F6',
          100: '#E1F2EC',
          200: '#C2E5D9',
          300: '#94D1C0',
          400: '#54B39A',
          500: '#20967A',
          600: '#0E7A62',
          700: '#087F8C',        // Secondary teal
          800: '#075E4B',        // Primary deep green
          900: '#054638',
          950: '#04382D',
        },
        teal: {
          50: '#F0FBFD',
          100: '#DCF6FA',
          200: '#BCECF4',
          300: '#8CDEEB',
          400: '#4EC4D8',
          500: '#21A7C0',
          600: '#148CA5',
          700: '#087F8C',        // Secondary teal
          800: '#0D6475',
          900: '#0F5361',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
