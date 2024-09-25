/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'monkey-dark': '#323437',
        'monkey-text': '#d1d0c5',
        'monkey-sub': '#646669',
        'monkey-primary': '#e2b714',
      },
    },
  },
  plugins: [],
}