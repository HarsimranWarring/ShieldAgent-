/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'shield-blue': '#3B82F6',
        'shield-red': '#EF4444',
        'shield-orange': '#F97316',
        'shield-green': '#22C55E',
      },
    },
  },
  plugins: [],
};
