/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ESSENCIAL
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
