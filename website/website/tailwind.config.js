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
        primary: {
          DEFAULT: '#0066CC',
          light: '#E6F3FF',
          dark: '#0052A3',
        },
        secondary: {
          DEFAULT: '#00A896',
          light: '#E6F9F5',
          dark: '#00867A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}