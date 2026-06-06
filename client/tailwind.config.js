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
        brand: {
          dark: '#050507',
          card: 'rgba(20, 20, 25, 0.7)',
          purple: '#a855f7',
          purpleDark: '#7e22ce',
          blue: '#3b82f6',
          neonBlue: '#06b6d4',
          neonPurple: '#d946ef',
          gray: '#1f1f23',
          border: 'rgba(255, 255, 255, 0.08)',
          textMuted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neonPurple: '0 0 15px rgba(168, 85, 247, 0.3)',
        neonBlue: '0 0 15px rgba(6, 182, 212, 0.3)',
      },
      backdropBlur: {
        glass: '16px',
      }
    },
  },
  plugins: [],
}
