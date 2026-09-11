/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        malayalam: ['"Manjari"', '"Noto Sans Malayalam"', '"Gayathri"', 'sans-serif'],
        sans: ['"Outfit"', '"Inter"', '"Manjari"', 'sans-serif'],
      },
      colors: {
        mill: {
          50: '#fbf8f2',
          100: '#f5eee0',
          200: '#ebddc1',
          300: '#dec49a',
          400: '#cfa670',
          500: '#b88647',
          600: '#9e6d38',
          700: '#7f532e',
          800: '#68432a',
          900: '#563826',
        }
      }
    },
  },
  plugins: [],
}
