/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#0f4728',
          950: '#062915',
        },
        brand: {
          deep: '#0B291B',
          primary: '#0E5C38',
          hover: '#09472B',
          light: '#EBF7F0',
          accent: '#10B981',
          surface: '#F8FAF9',
        }
      },
      boxShadow: {
        'glass-sm': '0 2px 10px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        'glass': '0 4px 20px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-md': '0 8px 24px -4px rgba(15, 23, 42, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        'glass-hover': '0 12px 32px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 1)',
        'glass-dark': '0 12px 32px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
