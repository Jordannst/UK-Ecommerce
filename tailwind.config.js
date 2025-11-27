/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'starg-pink': '#F8BBD0',      // Pink pastel utama
        'starg-pink-dark': '#F48FB1', // Pink untuk hover/darker
        'starg-pink-light': '#FFF0F5', // Lavender Blush untuk background
        'starg-pink-accent': '#FFB6C1', // Light Pink untuk accent
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


