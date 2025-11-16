/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"], // Changed from Inter to DM Sans
        numbers: ["Urbanist", "system-ui", "sans-serif"], // Added for numbers
      },
      colors: {
        'custom-teal': '#238D88',
      },
    },
  },
  plugins: [],
};