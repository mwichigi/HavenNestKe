/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#E8F5EE',
          100: '#D0EBDC',
          400: '#4DB87A',
          500: '#2D9B5A',
          600: '#1A6B3C',
          700: '#155432',
          800: '#0F3D24',
          900: '#0A2718',
          950: '#061810',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
};
