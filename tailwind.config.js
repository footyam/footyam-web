/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#34d399',
          600: '#10b981',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
};
