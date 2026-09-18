/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          600: '#16a34a',
        },
        green: {
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}

