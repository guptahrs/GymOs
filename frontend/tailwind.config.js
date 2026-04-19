/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        dark: "#020617",
        card: "#0F172A",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};